"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Sparkles, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "观测面板", icon: LayoutDashboard },
  { href: "/products", label: "商品管理", icon: Package },
  { href: "/assistant", label: "AI 助手", icon: Sparkles },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-hairline bg-surface-soft">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="text-primary text-xl leading-none">✳</span>
        <span className="font-display text-xl text-ink">一元小店</span>
      </div>

      <nav className="flex-1 px-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "mb-1 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-surface-dark text-on-dark"
                  : "text-body hover:bg-surface-card",
              )}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

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
