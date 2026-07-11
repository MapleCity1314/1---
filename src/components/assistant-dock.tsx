"use client";

import { useState } from "react";
import { X, Sparkles } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Assistant } from "@/app/(dashboard)/assistant/assistant";

/**
 * 桌面端右侧可折叠 AI 面板。挂在 (dashboard)/layout.tsx 里，
 * 所有页面共享同一个触发按钮 + 滑出面板，内部复用 <Assistant />
 * 和 chat-provider 里持久化的同一个 Chat 实例，与 /assistant 整页
 * 展示的状态完全同步。
 */
export function AssistantDock() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="AI 助手"
        aria-label="打开 AI 助手"
        className={cn(
          "fixed bottom-6 right-6 z-20 hidden items-center gap-2 rounded-full bg-surface-dark px-4 py-3 text-sm font-medium text-on-dark shadow-lg transition-transform hover:scale-[1.03] hover:bg-primary-active lg:flex",
          open && "invisible",
        )}
      >
        <Sparkles size={17} className="text-white" />
        AI 助手
      </button>

      {/* 遮罩 */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-30 bg-black/10 transition-opacity",
          open ? "opacity-100" : "invisible opacity-0",
        )}
      />

      {/* 滑出面板 */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-[420px] flex-col border-l border-hairline bg-canvas shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-secondary" />
            <span className="font-display text-lg text-ink">AI 助手</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="收起 AI 助手"
            className="rounded-md p-1.5 text-muted hover:bg-surface-card hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <Assistant />
      </div>
    </>
  );
}
