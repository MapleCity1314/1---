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

// 月亮 / 主题切换（装饰）
function Moon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />
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
  Loader,
  ImageOff,
  FileDown,
  Moon,
  Store,
};



