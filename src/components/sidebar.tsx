"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronsUpDown, Check, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODULES, resolveActiveModule } from "@/lib/modules";

/**
 * Tavily 风侧栏：品牌 logo → 模块切换器 → 当前模块导航 →
 * 平台级 AI 分区 → 用户页脚。AI 助手不是模块导航项：桌面端在内容区
 * 右上角以可折叠面板呼出（见 AssistantDock），移动端走底部 tab。
 * 「一元小店」被收束为首个业务模块，未来业务在 lib/modules.ts 追加即可。
 */
export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const active = resolveActiveModule(pathname);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-hairline bg-surface-soft lg:flex">
      {/* 品牌 */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-dark text-sm font-semibold text-on-dark">
          中
        </span>
        <span className="font-display text-lg text-ink">AI 中台</span>
      </div>

      {/* 模块切换器 */}
      <div className="relative px-3 pb-2">
        <button
          onClick={() => setSwitcherOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-lg border border-hairline bg-white px-3 py-2 text-left transition-colors hover:border-muted-soft"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-strong text-xs font-semibold text-body-strong">
            {active.glyph}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
            {active.name}
          </span>
          <ChevronsUpDown size={15} className="shrink-0 text-muted-soft" />
        </button>

        {switcherOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setSwitcherOpen(false)}
            />
            <div className="absolute inset-x-3 top-full z-20 mt-1 overflow-hidden rounded-lg border border-hairline bg-white py-1 shadow-lg">
              {MODULES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSwitcherOpen(false)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-soft"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-strong text-xs font-semibold text-body-strong">
                    {m.glyph}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink">{m.name}</span>
                  {m.id === active.id && (
                    <Check size={15} className="shrink-0 text-secondary" />
                  )}
                </button>
              ))}
              <div className="mt-1 flex items-center gap-2 border-t border-hairline-soft px-3 py-2 text-sm text-muted-soft">
                <Plus size={15} />
                更多业务 · 敬请期待
              </div>
            </div>
          </>
        )}
      </div>

      {/* 当前模块导航 */}
      <nav className="flex-1 px-3 pt-1">
        <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-soft">
          {active.name}
        </div>
        {active.nav.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "mb-1 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-surface-dark text-on-dark"
                  : "text-body hover:bg-surface-card",
              )}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </Link>
          );
        })}

        {/* 平台级 AI 分区 */}
        <div className="mt-5 px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-soft">
          平台
        </div>
        <div className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted">
          <Sparkles size={17} strokeWidth={2} className="text-secondary" />
          AI 助手
          <span className="ml-auto rounded-full bg-secondary/10 px-1.5 py-0.5 text-[10px] font-medium text-secondary">
            随处呼出
          </span>
        </div>
      </nav>

      {/* 用户页脚 */}
      <div className="border-t border-hairline px-3 py-3">
        <div className="truncate px-3 pb-2 text-xs text-muted" title={email}>
          {email}
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-surface-card"
          >
            <LogOut size={17} strokeWidth={2} />
            退出登录
          </button>
        </form>
      </div>
    </aside>
  );
}
