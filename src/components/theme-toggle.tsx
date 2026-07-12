"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "@/components/icons";

/**
 * 主题切换按钮：在 <html> 上切换 .dark class 并持久化到 localStorage。
 * 用 useSyncExternalStore 订阅 <html> 的 class 变化（MutationObserver），
 * 切换后图标自动更新；首帧防闪由 root layout 的内联脚本负责。
 */
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false, // 服务端快照：默认浅色
  );

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // 隐私模式下静默忽略
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "切换到浅色" : "切换到暗色"}
      title={dark ? "切换到浅色" : "切换到暗色"}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-card text-body transition-colors hover:text-ink"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
