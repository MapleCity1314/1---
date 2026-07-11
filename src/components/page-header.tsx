/**
 * Tavily 风页头：顶部一行 "面包屑 / 当前页" + 右侧控件区（状态徽标、动作），
 * 下面一行大标题。breadcrumb 默认落在业务模块名下。
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
    <div className="border-b border-hairline bg-canvas px-8 pb-6 pt-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <span>{breadcrumb}</span>
          <span className="text-muted-soft">/</span>
          <span className="text-body-strong">{title}</span>
        </div>
        {status}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[27px] leading-tight text-ink">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
