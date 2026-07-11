import { tool } from "ai";
import { z } from "zod";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products";
import { computeMetrics } from "@/lib/utils";
import { PRODUCT_STATUSES } from "@/lib/types";

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

function toInput(v: Record<string, unknown>) {
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
    status: (v.status as (typeof PRODUCT_STATUSES)[number]) ?? null,
    image_url: (v.image_url as string) ?? null,
    xianyu_url: (v.xianyu_url as string) ?? null,
    resource_url: (v.resource_url as string) ?? null,
    resource_code: (v.resource_code as string) ?? null,
    notes: (v.notes as string) ?? null,
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
        rows = [...rows].sort(
          (a, b) => ((a[sortBy] as number) - (b[sortBy] as number)) * dir || 0,
        );
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

  // ── 写工具：needsApproval 强制人工确认后才执行 ──
  createProductRecord: tool({
    description: "新增一个商品。执行前必须经用户确认。",
    inputSchema: z.object(productFields),
    needsApproval: true,
    execute: async (input) => {
      const created = await createProduct(toInput(input));
      return { ok: true, id: created.id, message: `已创建商品 ${created.id}` };
    },
  }),

  updateProductRecord: tool({
    description:
      "修改已有商品。传入商品编号及需要修改的字段（未传字段将被覆盖为空，请先查询原值再整体传入）。执行前必须经用户确认。",
    inputSchema: z.object(productFields),
    needsApproval: true,
    execute: async (input) => {
      const updated = await updateProduct(String(input.id), toInput(input));
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
