import { ThemeToggle } from "@/components/theme-toggle";
import { Github, Mail } from "@/components/icons";

/**
 * Tavily 还原顶栏：sticky 玻璃质感条（半透明+模糊+底部渐隐），
 * 左侧「面包屑 / 大标题」，右侧运行状态胶囊 + 实色背景图标按钮组 +
 * 主题切换。跨全宽，与下方内容用同一 px/max-w 对齐。
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumb = "一元小店",
  status,
  actions,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  status?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="glass-bar sticky top-0 z-20 border-b border-hairline">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-8 py-4">
        {/* 左：面包屑 + 大标题 */}
        <div className="min-w-0">
          <div className="mb-0.5 flex items-center gap-1.5 text-xs">
            <span className="text-muted">{breadcrumb}</span>
            <span className="text-muted-soft">/</span>
            <span className="text-body-strong">{title}</span>
          </div>
          <h1 className="truncate font-display text-[28px] leading-tight text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-sm text-muted">{subtitle}</p>
          )}
        </div>

        {/* 右：状态 + 实色图标按钮组 + 主题切换 + 动作 */}
        <div className="flex shrink-0 items-center gap-2.5">
          {status}
          <div className="flex items-center gap-1 rounded-full bg-surface-card p-1">
            <button
              type="button"
              aria-label="GitHub"
              title="GitHub"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-strong hover:text-ink"
            >
              <Github size={15} />
            </button>
            <button
              type="button"
              aria-label="联系我们"
              title="联系我们"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-strong hover:text-ink"
            >
              <Mail size={15} />
            </button>
          </div>
          <ThemeToggle />
          {actions}
        </div>
      </div>
    </div>
  );
}
