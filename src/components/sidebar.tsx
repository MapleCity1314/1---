"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MODULES, resolveActiveModule } from "@/lib/modules";
import { ChevronsUpDown, Check, Sparkles, ImagePlus, Folder, Plus, LogOut } from "@/components/icons";

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
    <div className="hidden shrink-0 p-5 lg:block">
      <aside className="flex h-full w-[272px] flex-col rounded-[28px] border border-hairline bg-card card-shadow">
        {/* 品牌 */}
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-dark text-base font-bold text-on-dark">
            中
          </span>
          <span className="font-display text-xl text-ink">AI 中台</span>
        </div>

        {/* 工作区切换器：periwinkle 胶囊 */}
        <div className="relative px-4 pb-4">
          <button
            onClick={() => setSwitcherOpen((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-full bg-switcher px-3 py-2.5 text-left transition-opacity hover:opacity-90"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-sm font-semibold text-switcher-ink">
              {active.glyph}
            </span>
            <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-switcher-ink">
              {active.name}
            </span>
            <ChevronsUpDown size={16} className="shrink-0 text-switcher-ink/70" />
          </button>

          {switcherOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSwitcherOpen(false)}
              />
              <div className="absolute inset-x-4 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-hairline bg-card py-1 shadow-lg">
                {MODULES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSwitcherOpen(false)}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[15px] hover:bg-surface-soft"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-switcher text-sm font-semibold text-switcher-ink">
                      {m.glyph}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ink">{m.name}</span>
                    {m.id === active.id && (
                      <Check size={16} className="shrink-0 text-secondary" />
                    )}
                  </button>
                ))}
                <div className="mt-1 flex items-center gap-2.5 border-t border-hairline-soft px-3.5 py-2.5 text-[15px] text-muted-soft">
                  <Plus size={16} />
                  更多业务 · 敬请期待
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mx-4 mb-2 border-t border-hairline-soft" />

        {/* 导航 */}
        <nav className="flex-1 px-4">
          {active.nav.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "mb-1 flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[15px] font-medium transition-colors",
                  isActive
                    ? "text-secondary"
                    : "text-body hover:bg-surface-soft",
                )}
              >
                <Icon
                  size={20}
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
              "mt-1 flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[15px] font-medium transition-colors",
              pathname.startsWith("/assistant")
                ? "text-secondary"
                : "text-body hover:bg-surface-soft",
            )}
          >
            <Sparkles
              size={20}
              className={
                pathname.startsWith("/assistant") ? "text-secondary" : "text-muted"
              }
            />
            AI 助手
          </Link>

          <Link
            href="/studio"
            className={cn(
              "mt-1 flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[15px] font-medium transition-colors",
              pathname.startsWith("/studio")
                ? "text-secondary"
                : "text-body hover:bg-surface-soft",
            )}
          >
            <ImagePlus
              size={20}
              className={
                pathname.startsWith("/studio") ? "text-secondary" : "text-muted"
              }
            />
            AI 绘图
          </Link>

          <Link
            href="/drive"
            className={cn(
              "mt-1 flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[15px] font-medium transition-colors",
              pathname.startsWith("/drive")
                ? "text-secondary"
                : "text-body hover:bg-surface-soft",
            )}
          >
            <Folder
              size={20}
              className={
                pathname.startsWith("/drive") ? "text-secondary" : "text-muted"
              }
            />
            文档库
          </Link>
        </nav>

        {/* 用户区 */}
        <div className="mx-4 border-t border-hairline-soft" />
        <div className="flex items-center gap-3 px-5 py-4.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-strong text-[15px] font-semibold text-body-strong">
            {initial}
          </span>
          <span
            className="min-w-0 flex-1 truncate text-sm text-muted"
            title={email}
          >
            {email}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              aria-label="退出登录"
              title="退出登录"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-soft hover:text-ink"
            >
              <LogOut size={17} />
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
