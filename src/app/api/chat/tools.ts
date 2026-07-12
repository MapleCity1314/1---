import { tool } from "ai";
import { tavily } from "@tavily/core";
import { z } from "zod";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products";
import { computeMetrics } from "@/lib/utils";
import { PRODUCT_STATUSES, type Product, type ProductInput, type ProductStatus } from "@/lib/types";

function requireTavily() {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("未配置 TAVILY_API_KEY，联网搜索/抓取功能当前不可用");
  }
  return tavily({ apiKey });
}

function tavilyErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

const productFields = {
  id: z.string().describe("商品编号，如 A001"),
  title: z.string().describe("商品标题"),
  category: z.string().nullish().describe("分类"),
  condition: z.string().nullish().describe("成色"),
  description: z.string().nullish().describe("商品信息"),
  cost: z.number().nullish().describe("成本价"),
  price: z.number().nullish().describe("闲鱼售价"),
  stock: z.number().int().nullish().describe("库存数量"),
  status: z.enum(PRODUCT_STATUSES).nullish().describe("上架状态"),
  image_url: z.string().nullish().describe("图片链接"),
  xianyu_url: z.string().nullish().describe("闲鱼商品链接"),
  resource_url: z.string().nullish().describe("虚拟资料链接（网盘/下载）"),
  resource_code: z.string().nullish().describe("资料提取码/密码"),
  notes: z.string().nullish().describe("备注"),
};

// 新建商品：模型未传的字段落到合理默认值（null / 库存 0）。
function buildCreateInput(v: Record<string, unknown>): ProductInput {
  return {
    id: String(v.id),
    title: String(v.title ?? ""),
    category: (v.category as string) ?? null,
    condition: (v.condition as string) ?? null,
    description: (v.description as string) ?? null,
    cost: (v.cost as number) ?? null,
    price: (v.price as number) ?? null,
    profit: null,
    profit_rate: null,
    stock: (v.stock as number) ?? 0,
    status: (v.status as ProductStatus) ?? null,
    image_url: (v.image_url as string) ?? null,
    xianyu_url: (v.xianyu_url as string) ?? null,
    resource_url: (v.resource_url as string) ?? null,
    resource_code: (v.resource_code as string) ?? null,
    notes: (v.notes as string) ?? null,
  };
}

// 更新商品：合并式更新。只覆盖模型显式传入（非 undefined）的字段，
// 未提及的字段保留数据库原值——避免模型漏传字段时被静默清空（例如库存被清零）。
function buildUpdateInput(v: Record<string, unknown>, existing: Product): ProductInput {
  const pick = <T>(key: keyof typeof v, fallback: T): T =>
    v[key as string] !== undefined ? (v[key as string] as T) : fallback;

  return {
    id: existing.id,
    title: pick("title", existing.title),
    category: pick("category", existing.category),
    condition: pick("condition", existing.condition),
    description: pick("description", existing.description),
    cost: pick("cost", existing.cost),
    price: pick("price", existing.price),
    profit: null, // 交由 updateProduct 内部按最新 cost/price 重新推算
    profit_rate: null,
    stock: pick("stock", existing.stock) ?? 0,
    status: pick("status", existing.status),
    image_url: pick("image_url", existing.image_url),
    xianyu_url: pick("xianyu_url", existing.xianyu_url),
    resource_url: pick("resource_url", existing.resource_url),
    resource_code: pick("resource_code", existing.resource_code),
    notes: pick("notes", existing.notes),
  };
}

export const tools = {
  // ── 只读工具：自动执行 ──
  queryProducts: tool({
    description:
      "查询商品列表。可按关键词、分类、状态筛选，可按字段排序，返回匹配的商品。用于回答库存、价格、利润等问题。",
    inputSchema: z.object({
      keyword: z.string().nullish().describe("在标题/编号/备注中模糊搜索"),
      category: z.string().nullish(),
      status: z.enum(PRODUCT_STATUSES).nullish(),
      sortBy: z
        .enum(["price", "profit", "profit_rate", "stock", "updated_at"])
        .nullish()
        .describe("排序字段"),
      order: z.enum(["asc", "desc"]).nullish().describe("升序/降序，默认降序"),
      limit: z.number().int().min(1).max(100).nullish().describe("返回条数，默认20"),
    }),
    execute: async ({ keyword, category, status, sortBy, order, limit }) => {
      let rows = await listProducts();
      if (keyword) {
        const k = keyword.toLowerCase();
        rows = rows.filter((p) =>
          [p.id, p.title, p.category, p.description, p.notes]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(k),
        );
      }
      if (category) rows = rows.filter((p) => p.category === category);
      if (status) rows = rows.filter((p) => p.status === status);
      if (sortBy) {
        const dir = order === "asc" ? 1 : -1;
        rows = [...rows].sort((a, b) => {
          const av = a[sortBy];
          const bv = b[sortBy];
          // updated_at 是 ISO 时间字符串，数字减法会得到 NaN 导致排序静默失效；
          // 数字字段走相减，其余（包括日期字符串）走字符串比较。
          if (typeof av === "number" && typeof bv === "number") {
            return (av - bv) * dir;
          }
          return String(av ?? "").localeCompare(String(bv ?? "")) * dir;
        });
      }
      return rows.slice(0, limit ?? 20);
    },
  }),

  getMetrics: tool({
    description:
      "获取整体经营指标汇总：商品总数、在售数、总库存、总成本、预估营收、预估总利润。用于解读观测面板。",
    inputSchema: z.object({}),
    execute: async () => {
      const rows = await listProducts();
      return computeMetrics(rows);
    },
  }),

  getProduct: tool({
    description: "按编号查询单个商品的完整信息。",
    inputSchema: z.object({ id: z.string() }),
    execute: async ({ id }) => {
      const p = await getProduct(id);
      return p ?? { error: "未找到该商品" };
    },
  }),

  // 闲鱼虚拟资料爆款文案：模型按公式自己填好结构化字段，这里只做校验/整理并原样返回，
  // 不落库——真要保存到商品上，再由模型另外调用 updateProductRecord（走确认卡片）。
  writeViralCopy: tool({
    description:
      "生成闲鱼「一元小店」虚拟资料商品的爆款文案（标题+正文+卖点+标签）。写文案本身不需要联网，也不修改任何数据，直接按公式产出结构化结果给用户看。",
    inputSchema: z.object({
      productId: z.string().nullish().describe("关联的商品编号（如果是给已有商品写文案）"),
      hook: z.string().describe("开头钩子：一句话戳中痛点或制造好奇，吸引点击"),
      title: z.string().max(30).describe("闲鱼标题，30字以内，含核心关键词"),
      sellingPoints: z.array(z.string()).min(1).describe("卖点列表，每条一句话"),
      body: z
        .string()
        .describe("正文全文：钩子→痛点→价值堆叠→信任状→交付说明→紧迫感，适度使用 emoji 分段，不堆砌"),
      tags: z.array(z.string()).nullish().describe("搜索关键词标签，便于被搜到"),
    }),
    execute: async (input) => {
      return { ok: true, copy: input, message: "文案已生成" };
    },
  }),

  researchMarket: tool({
    description:
      "调研闲鱼某关键词/品类的市场行情，并行获取竞品定价、需求热度、在售竞争三组数据，供选品和定价决策用。",
    inputSchema: z.object({
      keyword: z.string().describe('要调研的关键词，如"四六级资料"、"PS教程资源包"'),
      category: z.string().nullish().describe('可选分类，如"书籍"、"数码配件"'),
    }),
    execute: async ({ keyword, category }) => {
      try {
        const client = requireTavily();
        const scope = category ? `${category} ${keyword}` : keyword;
        const [pricing, demand, competition] = await Promise.all([
          client.search(`闲鱼 ${scope} 价格 多少钱`, { maxResults: 5, searchDepth: "basic" }),
          client.search(`${scope} 数字资料 资源 需求 热门`, { maxResults: 5, searchDepth: "basic" }),
          client.search(`闲鱼 ${scope} 卖家 竞品 在售`, { maxResults: 5, searchDepth: "basic" }),
        ]);
        return {
          ok: true,
          keyword,
          category: category ?? null,
          pricing: pricing.results.map((r) => ({ title: r.title, url: r.url, content: r.content })),
          demand: demand.results.map((r) => ({ title: r.title, url: r.url, content: r.content })),
          competition: competition.results.map((r) => ({ title: r.title, url: r.url, content: r.content })),
          researchedAt: new Date().toISOString(),
        };
      } catch (err) {
        return { ok: false, message: `市场调研失败：${tavilyErrorMessage(err)}` };
      }
    },
  }),

  // ── 联网工具：Tavily 全家桶，只读、自动执行 ──
  tavilySearch: tool({
    description:
      "联网搜索。用于查找最新信息、竞品价格、行业趋势等。返回结果列表（标题/链接/摘要），可选 AI 生成的直接答案。",
    inputSchema: z.object({
      query: z.string().describe("搜索关键词或问题"),
      maxResults: z.number().int().min(1).max(20).nullish().describe("返回条数，默认5"),
      searchDepth: z.enum(["basic", "advanced"]).nullish(),
      topic: z.enum(["general", "news", "finance"]).nullish(),
      includeAnswer: z.boolean().nullish().describe("是否附带 AI 直接生成的答案摘要"),
    }),
    execute: async ({ query, maxResults, searchDepth, topic, includeAnswer }) => {
      try {
        const client = requireTavily();
        const res = await client.search(query, {
          maxResults: maxResults ?? 5,
          searchDepth: searchDepth ?? "basic",
          topic: topic ?? "general",
          includeAnswer: includeAnswer ?? false,
        });
        return {
          ok: true,
          answer: res.answer ?? null,
          results: res.results.map((r) => ({
            title: r.title,
            url: r.url,
            content: r.content,
          })),
        };
      } catch (err) {
        return { ok: false, message: `搜索失败：${tavilyErrorMessage(err)}` };
      }
    },
  }),

  tavilyExtract: tool({
    description:
      "抓取指定网页/帖子的完整正文内容（含 x.com 帖子详情页）。用 advanced 深度尽力解析 JS 渲染页面，但部分需要登录的页面仍可能失败，失败会明确告知。",
    inputSchema: z.object({
      urls: z.array(z.string()).min(1).max(20).describe("要抓取的网页/帖子链接，最多20个"),
      extractDepth: z
        .enum(["basic", "advanced"])
        .nullish()
        .describe("抓取深度，默认 advanced，对 JS 渲染页面（如 x.com）更可靠"),
    }),
    execute: async ({ urls, extractDepth }) => {
      try {
        const client = requireTavily();
        const res = await client.extract(urls, {
          extractDepth: extractDepth ?? "advanced",
          format: "markdown",
        });
        return {
          ok: true,
          results: res.results.map((r) => ({ url: r.url, content: r.rawContent })),
          failed: res.failedResults.map((r) => ({ url: r.url, error: r.error })),
        };
      } catch (err) {
        return { ok: false, message: `抓取失败：${tavilyErrorMessage(err)}` };
      }
    },
  }),

  tavilyCrawl: tool({
    description: "从起始链接开始爬取整个站点的多个页面，用于批量了解一个网站的内容结构。",
    inputSchema: z.object({
      url: z.string().describe("起始链接"),
      maxDepth: z.number().int().min(1).max(5).nullish().describe("爬取深度，默认1"),
      limit: z.number().int().min(1).max(50).nullish().describe("最多爬取页面数，默认20"),
      instructions: z.string().nullish().describe("自然语言描述想要爬取的内容范围"),
    }),
    execute: async ({ url, maxDepth, limit, instructions }) => {
      try {
        const client = requireTavily();
        const res = await client.crawl(url, {
          maxDepth: maxDepth ?? 1,
          limit: limit ?? 20,
          instructions: instructions ?? undefined,
          extractDepth: "advanced",
          format: "markdown",
        });
        return {
          ok: true,
          baseUrl: res.baseUrl,
          results: res.results.map((r) => ({ url: r.url, content: r.rawContent })),
        };
      } catch (err) {
        return { ok: false, message: `爬取失败：${tavilyErrorMessage(err)}` };
      }
    },
  }),

  tavilyMap: tool({
    description: "获取一个网站的链接地图（不抓取正文），用于快速了解网站有哪些页面。",
    inputSchema: z.object({
      url: z.string().describe("网站起始链接"),
      limit: z.number().int().min(1).max(200).nullish().describe("最多返回链接数，默认50"),
      instructions: z.string().nullish().describe("自然语言描述想要哪类页面"),
    }),
    execute: async ({ url, limit, instructions }) => {
      try {
        const client = requireTavily();
        const res = await client.map(url, {
          limit: limit ?? 50,
          instructions: instructions ?? undefined,
        });
        return { ok: true, baseUrl: res.baseUrl, links: res.results };
      } catch (err) {
        return { ok: false, message: `获取站点地图失败：${tavilyErrorMessage(err)}` };
      }
    },
  }),

  // ── 写工具：needsApproval 强制人工确认后才执行 ──
  createProductRecord: tool({
    description: "新增一个商品。执行前必须经用户确认。",
    inputSchema: z.object(productFields),
    needsApproval: true,
    execute: async (input) => {
      const created = await createProduct(buildCreateInput(input));
      return { ok: true, id: created.id, message: `已创建商品 ${created.id}` };
    },
  }),

  updateProductRecord: tool({
    description:
      "修改已有商品。传入商品编号及需要修改的字段即可，未提及的字段会自动保留原值（合并式更新）。执行前必须经用户确认。",
    inputSchema: z.object(productFields),
    needsApproval: true,
    execute: async (input) => {
      const existing = await getProduct(String(input.id));
      if (!existing) {
        return { ok: false, message: `未找到商品 ${input.id}，无法更新` };
      }
      const updated = await updateProduct(existing.id, buildUpdateInput(input, existing));
      return { ok: true, id: updated.id, message: `已更新商品 ${updated.id}` };
    },
  }),

  deleteProductRecord: tool({
    description: "删除一个商品。执行前必须经用户确认。此操作不可撤销。",
    inputSchema: z.object({ id: z.string().describe("要删除的商品编号") }),
    needsApproval: true,
    execute: async ({ id }) => {
      await deleteProduct(id);
      return { ok: true, id, message: `已删除商品 ${id}` };
    },
  }),
};
