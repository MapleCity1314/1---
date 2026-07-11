"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MODULES, resolveActiveModule } from "@/lib/modules";
import { ChevronsUpDown, Check, Sparkles, Plus, LogOut } from "@/components/icons";

/**
 * Tavily 还原侧栏：整块白/深灰胶囊面板（不是上下分离的小卡），
 * 从上到下依次是 品牌 logo → periwinkle 工作区切换器胶囊 →
 * 线性图标导航（active 蓝字蓝标）→ 平台级 AI → 底部用户区。
 * 「一元小店」被收束为首个业务模块，未来业务在 lib/modules.ts 追加。
 */
export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const active = resolveActiveModule(pathname);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const initial = (email.trim()[0] || "U").toUpperCase();

  return (
    <div className="hidden shrink-0 p-3 lg:block">
      <aside className="flex h-full w-[236px] flex-col rounded-[26px] border border-hairline bg-card card-shadow">
        {/* 品牌 */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-dark text-sm font-bold text-on-dark">
            中
          </span>
          <span className="font-display text-[17px] text-ink">AI 中台</span>
        </div>

        {/* 工作区切换器：periwinkle 胶囊 */}
        <div className="relative px-3 pb-3">
          <button
            onClick={() => setSwitcherOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-full bg-switcher px-2.5 py-2 text-left transition-opacity hover:opacity-90"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card text-xs font-semibold text-switcher-ink">
              {active.glyph}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-switcher-ink">
              {active.name}
            </span>
            <ChevronsUpDown size={15} className="shrink-0 text-switcher-ink/70" />
          </button>

          {switcherOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSwitcherOpen(false)}
              />
              <div className="absolute inset-x-3 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-hairline bg-card py-1 shadow-lg">
                {MODULES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSwitcherOpen(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface-soft"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-switcher text-xs font-semibold text-switcher-ink">
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

        <div className="mx-3 mb-2 border-t border-hairline-soft" />

        {/* 导航 */}
        <nav className="flex-1 px-3">
          {active.nav.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "text-secondary"
                    : "text-body hover:bg-surface-soft",
                )}
              >
                <Icon
                  size={18}
                  className={isActive ? "text-secondary" : "text-muted"}
                />
                {label}
              </Link>
            );
          })}

          {/* 平台级 AI */}
          <Link
            href="/assistant"
            className={cn(
              "mt-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith("/assistant")
                ? "text-secondary"
                : "text-body hover:bg-surface-soft",
            )}
          >
            <Sparkles
              size={18}
              className={
                pathname.startsWith("/assistant") ? "text-secondary" : "text-muted"
              }
            />
            AI 助手
          </Link>
        </nav>

        {/* 用户区 */}
        <div className="mx-3 border-t border-hairline-soft" />
        <div className="flex items-center gap-2.5 px-4 py-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-strong text-sm font-semibold text-body-strong">
            {initial}
          </span>
          <span
            className="min-w-0 flex-1 truncate text-xs text-muted"
            title={email}
          >
            {email}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              aria-label="退出登录"
              title="退出登录"
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-soft hover:text-ink"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
