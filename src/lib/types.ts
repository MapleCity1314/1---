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
