import { Moon } from "@/components/icons";

/**
 * Tavily 还原顶栏：居中内容列内，上排「面包屑 / 当前页」+ 右侧控件
 * （运行状态胶囊、圆形图标按钮、主题切换），下排大标题 + 动作区。
 * 圆形图标按钮为纯装饰（还原视觉），主题切换暂不接逻辑。
 */
function CircleButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-muted transition-colors hover:text-ink card-shadow"
    >
      {children}
    </button>
  );
}

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
    <div className="pt-7">
      <div className="mx-auto max-w-4xl px-6">
        {/* 上排：面包屑 + 右侧控件 */}
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-muted">{breadcrumb}</span>
            <span className="text-muted-soft">/</span>
            <span className="text-body-strong">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {status}
            <CircleButton label="切换主题">
              <Moon size={16} />
            </CircleButton>
          </div>
        </div>

        {/* 下排：大标题 + 动作 */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[30px] leading-tight text-ink">
              {title}
            </h1>
            {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
