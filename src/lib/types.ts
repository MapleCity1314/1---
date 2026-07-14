// 商品上架状态（对齐台账「分类与状态」表）
export const PRODUCT_STATUSES = [
  "待拍图",
  "待上架",
  "已上架",
  "已售出",
  "下架",
] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

// 商品记录（对应 Supabase products 表）
export interface Product {
  id: string; // 商品编号（业务主键，如 A001）
  title: string; // 商品标题
  category: string | null; // 分类
  condition: string | null; // 成色
  description: string | null; // 商品信息
  cost: number | null; // 成本价
  price: number | null; // 闲鱼售价
  profit: number | null; // 预估利润（可自动算）
  profit_rate: number | null; // 利润率（可自动算）
  stock: number | null; // 库存数量
  status: ProductStatus | null; // 上架状态
  image_url: string | null; // 图片链接
  xianyu_url: string | null; // 闲鱼商品链接
  resource_url: string | null; // ⭐ 虚拟资料链接（网盘/下载）
  resource_code: string | null; // ⭐ 提取码/密码
  notes: string | null; // 备注
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
  updated_by: string | null; // 最后修改人（邮箱）
}

// 新建/编辑表单的可写字段
export type ProductInput = Omit<
  Product,
  "created_at" | "updated_at" | "updated_by"
>;

export interface DashboardMetrics {
  count: number;
  totalStock: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  onSaleCount: number;
}

// 文档库节点（对应 Supabase drive_nodes 表，文件夹和文件同表）
export type DriveNodeKind = "folder" | "file";

export interface DriveNode {
  id: string;
  parent_id: string | null;
  kind: DriveNodeKind;
  name: string;
  storage_path: string | null; // 仅文件
  mime_type: string | null;
  ext: string | null; // 小写扩展名，不含点
  size: number | null; // 字节
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

// 注册新文件记录时的可写字段
export type DriveNodeInput = Pick<
  DriveNode,
  "name" | "parent_id" | "storage_path" | "mime_type" | "ext" | "size"
>;

// ============================================================
// 盘面研报模块
// ============================================================

export const ASSET_TYPES = ["crypto", "commodity", "stock", "macro"] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

// 关注清单条目（对应 Supabase watchlist_items 表）
export interface WatchlistItem {
  id: string;
  symbol: string; // 展示用代码，如 BTCUSDT / XAUUSD / SKHYNIXUSDT
  display_name: string; // 展示名，如「BTC」「黄金」
  asset_type: AssetType;
  binance_symbol: string | null; // 能在 Binance 拉到 K 线时填；否则走 Tavily
  sort_order: number;
  enabled: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

// 新建/编辑表单可写字段
export type WatchlistItemInput = Omit<
  WatchlistItem,
  "id" | "created_at" | "updated_at" | "updated_by"
> & { id?: string };

// 位点数据来源：区分「服务端从 K 线确定性计算」还是「AI 基于联网结果估算」
export type BriefDataSource = "binance" | "tavily_estimated";

// 单个标的的研报内容（对齐用户示例中"支撑/压力/思路/结论"的版式）
export interface BriefAssetSection {
  symbol: string;
  display_name: string;
  data_source: BriefDataSource;
  last_price: number | null;
  support_levels: number[]; // 由近到远，如 [1350, 1310, 1275]
  resistance_levels: number[];
  bias: string; // 思路结论，如"偏空高波动"
  entry_plan: string; // 进出场策略描述
  stop_loss: number | null;
  take_profits: number[]; // TP0/TP1/TP2...
  invalidation: string | null; // 空头/多头逻辑失效条件
}

// 完整研报结构化正文（存 trading_briefs.payload）
export interface BriefPayload {
  assets: BriefAssetSection[];
  conclusion: string; // 今日总结论
  watch_schedule: string[]; // 今日重点关注时间表条目
  risk_notes: string[]; // 风险提醒与禁止交易条件
  sources: string[]; // 参考来源
  disclaimer: string; // 固定免责声明
}

export type TradingBriefScope = "daily" | "manual" | "event";

// 研报记录（对应 Supabase trading_briefs 表）
export interface TradingBrief {
  id: string;
  scope: TradingBriefScope;
  title: string;
  event_note: string | null;
  payload: BriefPayload;
  summary: string | null;
  generated_at: string;
  created_by: string | null;
}
