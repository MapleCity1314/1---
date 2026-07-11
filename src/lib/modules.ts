import { Grid, Box } from "@/components/icons";

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
];

/** 根据当前路径判断命中的模块（暂时都归属首个模块）。 */
export function resolveActiveModule(_pathname: string): BusinessModule {
  return MODULES[0];
}
