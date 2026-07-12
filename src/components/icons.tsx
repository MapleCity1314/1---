import * as React from "react";

/**
 * 自建内联 SVG 图标库（不依赖任何第三方图标包）。
 * 统一 24 视窗、线性描边风格。用法：<Icon.Plus size={16} className="..." />
 * 描边继承 currentColor，尺寸由 size 控制。
 */

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

function Svg({
  size = 18,
  className,
  strokeWidth = 1.75,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// 网格 / 观测面板
function Grid(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Svg>
  );
}

// 盒子 / 商品
function Box(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3.3 7.5 12 12l8.7-4.5" />
      <path d="M12 21.5V12" />
    </Svg>
  );
}

// 火花 / AI
function Sparkles(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8.5 13.4 11 16 12l-2.6 1L12 15.5 10.6 13 8 12l2.6-1L12 8.5Z" />
    </Svg>
  );
}

// 加号
function Plus(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

// 关闭
function X(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

// 勾选
function Check(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 12.5 9 17.5 20 6.5" />
    </Svg>
  );
}
// 上下切换箭头（组织切换器）
function ChevronsUpDown(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
    </Svg>
  );
}

// 退出登录
function LogOut(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17 15 12 10 7" />
      <path d="M15 12H3" />
    </Svg>
  );
}

// 发送
function Send(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 12 20 4 14 20 11 13 4 12Z" />
    </Svg>
  );
}

// 扳手 / 工具执行中
function Wrench(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14.5 5.5a3.5 3.5 0 0 0-4.6 4.3L4 15.7 8.3 20l5.9-5.9a3.5 3.5 0 0 0 4.3-4.6l-2.4 2.4-2-2 2.4-2.4Z" />
    </Svg>
  );
}

// 警示三角
function AlertTriangle(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4 2.5 20h19L12 4Z" />
      <path d="M12 10v5M12 18h.01" />
    </Svg>
  );
}

// 垃圾桶 / 删除
function Trash(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </Svg>
  );
}

// 铅笔 / 编辑
function Pencil(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M15 5 19 9 8 20 4 20 4 16 15 5Z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </Svg>
  );
}
// 外链
function ExternalLink(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 4h6v6M20 4 11 13" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </Svg>
  );
}

// 复制
function Copy(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </Svg>
  );
}

// 卡片视图（九宫格）
function LayoutGrid(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

// 列表视图
function List(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </Svg>
  );
}

// 排序上下箭头
function ArrowUpDown(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />
    </Svg>
  );
}

// 搜索
function Search(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21 16.5 16.5" />
    </Svg>
  );
}
// 图片 + 加号（上传占位）
function ImagePlus(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8" />
      <circle cx="9" cy="9" r="1.6" />
      <path d="M4 16l4-4 4 4M18 15v6M15 18h6" />
    </Svg>
  );
}

// 回形针 / 添加附件
function Paperclip(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8" />
    </Svg>
  );
}

// 加载中（旋转由 className animate-spin 控制）
function Loader(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3v4M12 17v4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M3 12h4M17 12h4M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </Svg>
  );
}

// 图片损坏 / 错误
function ImageOff(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </Svg>
  );
}

// 下载文件（虚拟资料）
function FileDown(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M12 12v5M9.5 14.5 12 17l2.5-2.5" />
    </Svg>
  );
}

// 月亮 / 切到暗色
function Moon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />
    </Svg>
  );
}

// 太阳 / 切到浅色
function Sun(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Svg>
  );
}

// GitHub（装饰社交图标）
function Github(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 19c-4 1.4-4-2-6-2.5M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C10.5 1 9.5 1.3 9.5 1.3a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 8 7.7c0 4.6 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21" />
    </Svg>
  );
}

// 邮件（装饰）
function Mail(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5 12 12.5 20.5 6.5" />
    </Svg>
  );
}

// 店铺 / 模块标记
function Store(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 9V5h16v4M4 9l1.2-4h13.6L20 9M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
      <path d="M5 10.5V20h14v-9.5" />
      <path d="M9 20v-5h4v5" />
    </Svg>
  );
}
// 齿轮 / 设置
function Settings(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.35a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.65 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.65a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.65a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.35 9a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z" />
    </Svg>
  );
}

// 图钉 / 固定
function Pin(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 17v5" />
      <path d="M8 3h8l-1 6 3 3v2H6v-2l3-3-1-6Z" />
    </Svg>
  );
}

// 图钉（取消固定）
function PinOff(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2 2l20 20" />
      <path d="M12 17v5" />
      <path d="M9 3h7l-1 6 3 3v2h-3" />
      <path d="M8.5 8.5 8 9l-1 6h4" />
    </Svg>
  );
}

// 放大 / 全屏
function Maximize(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
    </Svg>
  );
}

// 左箭头
function ChevronLeft(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M15 6 9 12l6 6" />
    </Svg>
  );
}

// 右箭头
function ChevronRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

// 下箭头
function ChevronDown(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

// 文件夹
function Folder(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.6l1.8 2H19.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-11Z" />
    </Svg>
  );
}

// 新建文件夹
function FolderPlus(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.6l1.8 2H19.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-11Z" />
      <path d="M12 10.5v5M9.5 13h5" />
    </Svg>
  );
}

// 通用文件
function File(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </Svg>
  );
}

// 文本文件
function FileText(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 16.5h6" />
    </Svg>
  );
}

// 表格文件
function FileSpreadsheet(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M8 12.5h8M8 16h8M11 12.5V19M14.5 12.5V19" />
    </Svg>
  );
}

// 幻灯片文件
function FileSlides(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <rect x="8" y="12" width="8" height="5" rx="1" />
    </Svg>
  );
}

// 上传
function Upload(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 16V4M8 8l4-4 4 4" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Svg>
  );
}

// 下载
function Download(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4v12M8 12l4 4 4-4" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Svg>
  );
}

// 更多操作（横向省略号）
function MoreHorizontal(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth={(p.strokeWidth ?? 1.75) * 1.6} />
    </Svg>
  );
}

export {
  Grid,
  Box,
  Sparkles,
  Plus,
  X,
  Check,
  ChevronsUpDown,
  LogOut,
  Send,
  Wrench,
  AlertTriangle,
  Trash,
  Pencil,
  ExternalLink,
  Copy,
  LayoutGrid,
  List,
  ArrowUpDown,
  Search,
  ImagePlus,
  Paperclip,
  Loader,
  ImageOff,
  FileDown,
  Moon,
  Sun,
  Github,
  Mail,
  Store,
  Settings,
  Pin,
  PinOff,
  Maximize,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderPlus,
  File,
  FileText,
  FileSpreadsheet,
  FileSlides,
  Upload,
  Download,
  MoreHorizontal,
};



