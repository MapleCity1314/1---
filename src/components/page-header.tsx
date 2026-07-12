import { ThemeToggle } from "@/components/theme-toggle";
import { Github, Mail } from "@/components/icons";

/**
 * 悬浮玻璃胶囊顶栏：与侧栏呼应的圆角面板语言，收成
 * rounded-full 的宽条，四周留白让它“浮”在画布上而不贴边。
 * 左侧只留标题，右侧运行状态胶囊 + 实色图标按钮组 + 主题切换。
 */
export function PageHeader({
  title,
  status,
  actions,
}: {
  title: string;
  status?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-20 px-6 pt-8">
      <div className="glass-capsule mx-auto flex max-w-4xl items-center justify-between gap-5 rounded-full border border-hairline px-8 py-4">
        <h1 className="truncate font-display text-2xl leading-none text-ink">
          {title}
        </h1>

        {/* 右：状态 + 实色图标按钮组 + 主题切换 + 动作 */}
        <div className="flex shrink-0 items-center gap-3">
          {status}
          <div className="flex items-center gap-1.5 rounded-full bg-surface-card p-1.5">
            <button
              type="button"
              aria-label="GitHub"
              title="GitHub"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-strong hover:text-ink"
            >
              <Github size={18} />
            </button>
            <button
              type="button"
              aria-label="联系我们"
              title="联系我们"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-strong hover:text-ink"
            >
              <Mail size={18} />
            </button>
          </div>
          <ThemeToggle />
          {actions}
        </div>
      </div>
    </div>
  );
}
