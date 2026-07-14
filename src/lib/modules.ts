import { Grid, Box, LineChart, List } from "@/components/icons";

/**
 * 中台业务模块注册表。
 * 一元小店是首个模块；未来新增业务时在这里追加一个条目即可，
 * 侧栏的模块切换器与导航会自动跟随。每个模块自带一组导航项。
 */
type IconComponent = (props: { size?: number; className?: string }) => React.ReactElement;

export interface ModuleNavItem {
  href: string;
  label: string;
  icon: IconComponent;
}

export interface BusinessModule {
  id: string;
  name: string;
  /** 头像文字标记，显示在切换器里 */
  glyph: string;
  /** 该模块的落地路由（点击模块切换器时跳转） */
  home: string;
  nav: ModuleNavItem[];
  enabled: boolean;
}

export const MODULES: BusinessModule[] = [
  {
    id: "xianyu-1yuan",
    name: "一元小店",
    glyph: "壹",
    home: "/",
    enabled: true,
    nav: [
      { href: "/", label: "观测面板", icon: Grid },
      { href: "/products", label: "商品管理", icon: Box },
    ],
  },
  {
    id: "trade-brief",
    name: "盘面研报",
    glyph: "盘",
    home: "/briefs",
    enabled: true,
    nav: [
      { href: "/briefs", label: "研报列表", icon: LineChart },
      { href: "/briefs/watchlist", label: "关注清单", icon: List },
    ],
  },
];

/** 根据当前路径前缀判断命中的模块，未匹配到时归属首个模块（默认业务）。 */
export function resolveActiveModule(pathname: string): BusinessModule {
  const hit = MODULES.find(
    (m) => m.id !== "xianyu-1yuan" && m.nav.some((item) => pathname.startsWith(item.href)),
  );
  return hit ?? MODULES[0];
}
