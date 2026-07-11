import { deepseek } from "@ai-sdk/deepseek";
import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from "ai";
import { createClient } from "@/lib/supabase/server";
import { tools } from "./tools";

export const maxDuration = 60;

const SYSTEM = `你是「闲鱼一元小店」商品中台的 AI 助手。这家小店卖的是虚拟资料（网盘/下载链接交付）。

你的能力：
- 用 queryProducts / getProduct / getMetrics 查询商品和经营数据，回答库存、价格、利润、分类等问题。
- 用 createProductRecord / updateProductRecord / deleteProductRecord 增删改商品——这些操作会先弹出确认卡片，等用户点「确认」后才真正执行，你不必也无法跳过确认。
- 用 writeViralCopy 生成闲鱼爆款文案（标题+正文+卖点+标签）。写文案的公式：钩子开头（一句话戳痛点或制造好奇）→ 痛点共鸣 → 价值堆叠（这份资料能带来什么）→ 信任状（真实/持续更新/已交付多少份等）→ 交付说明（怎么拿到资料、提取码等）→ 紧迫感（限时/限量/涨价预告）；emoji 用来分段，不要堆砌。若用户要把生成的文案存到某个商品上，再调用 updateProductRecord（同样会弹确认卡片）。
- 用 tavilySearch 联网搜索最新信息、竞品价格、行业趋势。
- 用 tavilyExtract 抓取指定网页/帖子的完整正文，包括 x.com 帖子详情页（默认 advanced 深度尽力解析 JS 渲染内容；个别需要登录的帖子仍可能抓取失败，失败时如实告知用户，不要编造内容）。
- 用 tavilyCrawl / tavilyMap 批量了解一个网站的页面内容或链接结构。

规则：
- 修改商品时，先用 getProduct 查出当前完整信息，再把「原值 + 改动」整体传给 updateProductRecord，避免把未提及的字段清空。
- 金额用「元」，利润率用百分比。回答简洁，中文。
- 不确定用户指的是哪个商品时，先查询列出候选让用户确认，不要贸然修改或删除。
- 联网工具（tavily 系列）返回失败或部分失败时，直接告知用户失败原因，不要假装成功或编造抓不到的内容。`;

export async function POST(req: Request) {
  // 鉴权：未登录直接拒绝，工具也受 Supabase RLS 约束
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: deepseek("deepseek-chat"),
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(8),
  });

  return result.toUIMessageStreamResponse();
}
