"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Box, Sparkles } from "@/components/icons";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "面板", icon: Grid },
  { href: "/products", label: "商品", icon: Box },
  { href: "/assistant", label: "AI 助手", icon: Sparkles },
];

/**
 * 移动端底部 tab bar（lg 以下显示）。AI 助手在移动端走独立的
 * /assistant 整页路由，而不是桌面端的右侧滑出面板——小屏放不下
 * 悬浮面板，所以单独给它一个 tab。
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-hairline bg-card lg:hidden">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
              active ? "text-ink" : "text-muted",
            )}
          >
            <Icon
              size={19}
              strokeWidth={2}
              className={cn(href === "/assistant" && "text-secondary")}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
