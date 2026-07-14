import "server-only";
import { deepseek } from "@ai-sdk/deepseek";
import { generateObject } from "ai";
import { z } from "zod";
import { tavily } from "@tavily/core";
import { fetchMarketSnapshot } from "@/lib/market/binance";
import { computeLevels } from "@/lib/market/indicators";
import { listEnabledWatchlist, createBrief } from "@/lib/briefs";
import type { WatchlistItem, BriefPayload, TradingBrief, TradingBriefScope } from "@/lib/types";

/**
 * 研报生成编排：
 *  1. 逐个标的取数——crypto 类走 Binance 拉 K 线算出「权威位点」；
 *     其余（含 Binance 拉取失败的）走 Tavily 联网搜索，作为上下文交给 AI 估算。
 *  2. 把「权威位点」和「联网上下文」一起喂给 DeepSeek，用 generateObject 强约束输出结构，
 *     AI 只负责思路/策略文字，不允许改动已计算出的数值。
 *  3. 落库。
 */

interface AssetContext {
  item: WatchlistItem;
  dataSource: "binance" | "tavily_estimated";
  computed?: {
    lastPrice: number;
    supports: number[];
    resistances: number[];
    atr15m: number | null;
    rangeHigh: number;
    rangeLow: number;
  };
  research?: { title: string; url: string; content: string }[];
  researchError?: string;
}

function requireTavily() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("未配置 TAVILY_API_KEY，无法联网调研非加密标的");
  return tavily({ apiKey });
}

async function gatherAssetContext(item: WatchlistItem): Promise<AssetContext> {
  if (item.asset_type === "crypto" && item.binance_symbol) {
    try {
      const snapshot = await fetchMarketSnapshot(item.binance_symbol);
      const levels = computeLevels(
        snapshot.lastPrice,
        snapshot.klines15m,
        snapshot.klines1h,
        snapshot.klines1d,
      );
      return {
        item,
        dataSource: "binance",
        computed: {
          lastPrice: levels.lastPrice,
          supports: levels.supports,
          resistances: levels.resistances,
          atr15m: levels.atr15m,
          rangeHigh: levels.rangeHigh,
          rangeLow: levels.rangeLow,
        },
      };
    } catch (err) {
      // Binance 拉不到（符号不存在/接口异常等）时回退到 Tavily，不让整份研报因单个标的失败而中断
      return await gatherViaTavily(item, err instanceof Error ? err.message : String(err));
    }
  }
  return await gatherViaTavily(item);
}

async function gatherViaTavily(item: WatchlistItem, fallbackReason?: string): Promise<AssetContext> {
  try {
    const client = requireTavily();
    const res = await client.search(
      `${item.display_name} ${item.symbol} 最新价格 支撑 压力 走势分析`,
      { maxResults: 5, searchDepth: "advanced", topic: item.asset_type === "macro" ? "news" : "general" },
    );
    return {
      item,
      dataSource: "tavily_estimated",
      research: res.results.map((r) => ({ title: r.title, url: r.url, content: r.content })),
      researchError: fallbackReason ? `Binance 数据获取失败，已回退联网调研（原因：${fallbackReason}）` : undefined,
    };
  } catch (err) {
    return {
      item,
      dataSource: "tavily_estimated",
      research: [],
      researchError: `联网调研失败：${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// 研报结构化输出 schema（镜像 BriefPayload），强约束 AI 输出格式
const briefSchema = z.object({
  assets: z.array(
    z.object({
      symbol: z.string(),
      bias: z.string().describe("思路结论，如'偏空高波动'"),
      entry_plan: z.string().describe("进出场策略描述，含止损止盈的文字说明"),
      invalidation: z.string().nullable().describe("多头/空头逻辑失效条件"),
    }),
  ),
  conclusion: z.string().describe("今日总结论，覆盖宏观风险、主策略方向"),
  watch_schedule: z.array(z.string()).describe("今日重点关注时间表条目（北京时间）"),
  risk_notes: z.array(z.string()).describe("风险提醒与禁止交易条件"),
});

const DISCLAIMER =
  "本研报由 AI 结合行情数据自动生成，仅为盘面整理与思路参考，不构成任何投资建议。加密标的位点为服务端实时计算，其余标的位点为 AI 基于联网检索的估算值，执行前请以实时盘口为准，自行承担交易风险。";

function buildPrompt(contexts: AssetContext[], eventNote?: string | null): string {
  const sections = contexts
    .map((ctx) => {
      const { item } = ctx;
      if (ctx.dataSource === "binance" && ctx.computed) {
        return `【${item.display_name}（${item.symbol}）· 数据来源：Binance 实时计算】
现价：${ctx.computed.lastPrice}
支撑位（由近到远，服务端计算，不可更改数值）：${ctx.computed.supports.join(" / ") || "无"}
压力位（由近到远，服务端计算，不可更改数值）：${ctx.computed.resistances.join(" / ") || "无"}
15m ATR：${ctx.computed.atr15m ?? "无"}
近30日区间：${ctx.computed.rangeLow} - ${ctx.computed.rangeHigh}`;
      }
      const research = ctx.research?.length
        ? ctx.research.map((r) => `- ${r.title}：${r.content.slice(0, 300)}`).join("\n")
        : "（无联网检索结果）";
      return `【${item.display_name}（${item.symbol}）· 数据来源：联网检索估算${ctx.researchError ? `，注意：${ctx.researchError}` : ""}】
联网检索摘要：
${research}
请基于以上检索内容自行估算现价区间、支撑位、压力位、止损、止盈（TP0/TP1/TP2），并在思路文字中体现数据不确定性。`;
    })
    .join("\n\n");

  return `你是专业的多资产盘面分析师，需要为以下标的分别给出交易思路，并汇总成今日研报。

${eventNote ? `本次研报是围绕关键节点生成：${eventNote}\n\n` : ""}标的数据：
${sections}

要求：
- assets 数组必须逐一对应上面列出的标的（symbol 字段填标的代码，与上面一致），不要遗漏、不要新增。
- entry_plan 里需包含具体的止损、止盈（TP0/TP1/TP2）文字描述；标注了「服务端计算」的位点数值必须原样使用，不得擅自更改。
- conclusion 汇总所有标的给出宏观层面的今日总判断（参考示例口吻：震荡偏空/多头趋势健全等）。
- watch_schedule 按北京时间给出今日需要关注的时间点/事件。
- risk_notes 给出交易纪律和禁止交易条件（如"禁止把到价当成交，必须15m/1H确认"之类）。
- 全部用中文，语言专业、简洁，贴近真实交易员研报口吻。`;
}

function extractLevels(ctx: AssetContext): { support_levels: number[]; resistance_levels: number[]; last_price: number | null; stop_loss: number | null; take_profits: number[] } {
  if (ctx.dataSource === "binance" && ctx.computed) {
    return {
      last_price: ctx.computed.lastPrice,
      support_levels: ctx.computed.supports,
      resistance_levels: ctx.computed.resistances,
      // 止损/止盈由 AI 在 entry_plan 文字中给出（依赖联网/权威位点综合判断），
      // payload 数值字段留空，前端渲染时以 entry_plan 文字为准。
      stop_loss: null,
      take_profits: [],
    };
  }
  return { last_price: null, support_levels: [], resistance_levels: [], stop_loss: null, take_profits: [] };
}

export async function generateBrief(options: {
  scope: TradingBriefScope;
  eventNote?: string | null;
}): Promise<TradingBrief> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("未配置 DEEPSEEK_API_KEY，无法生成研报");
  }

  const watchlist = await listEnabledWatchlist();
  if (watchlist.length === 0) {
    throw new Error("关注清单为空，请先在「关注清单」里添加至少一个标的");
  }

  const contexts = await Promise.all(watchlist.map(gatherAssetContext));

  const { object } = await generateObject({
    model: deepseek("deepseek-chat"),
    schema: briefSchema,
    prompt: buildPrompt(contexts, options.eventNote),
  });

  // 按 symbol 对齐 AI 返回的思路文字与我们计算/检索到的数值，AI 若漏项则兜底填充
  const aiBySymbol = new Map(object.assets.map((a) => [a.symbol, a]));
  const assets: BriefPayload["assets"] = contexts.map((ctx) => {
    const ai = aiBySymbol.get(ctx.item.symbol);
    const levels = extractLevels(ctx);
    return {
      symbol: ctx.item.symbol,
      display_name: ctx.item.display_name,
      data_source: ctx.dataSource,
      ...levels,
      bias: ai?.bias ?? "（AI 未返回该标的思路，请重新生成）",
      entry_plan: ai?.entry_plan ?? "",
      invalidation: ai?.invalidation ?? null,
    };
  });

  const sources = [
    "Binance Futures（加密标的实时行情）",
    ...(contexts.some((c) => c.dataSource === "tavily_estimated") ? ["Tavily 联网检索"] : []),
  ];

  const payload: BriefPayload = {
    assets,
    conclusion: object.conclusion,
    watch_schedule: object.watch_schedule,
    risk_notes: object.risk_notes,
    sources,
    disclaimer: DISCLAIMER,
  };

  const now = new Date();
  const dateLabel = now.toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" });
  const title =
    options.scope === "daily"
      ? `${dateLabel} 每日盘面研报`
      : options.eventNote
        ? `${dateLabel} 关键节点研报 · ${options.eventNote}`
        : `${dateLabel} 盘面研报`;

  return createBrief({
    scope: options.scope,
    title,
    event_note: options.eventNote ?? null,
    payload,
    summary: object.conclusion,
  });
}
