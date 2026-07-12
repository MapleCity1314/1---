"use client";

import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Settings, Search } from "@/components/icons";
import { useFloatingPanel } from "./hooks/use-floating-panel";
import type { ThinkingLevel, Resolution, Quality } from "./types";

interface SettingsPanelProps {
  showGeminiOptions: boolean;
  showQuality: boolean;
  thinkingLevel: ThinkingLevel;
  setThinkingLevel: (level: ThinkingLevel) => void;
  resolution: Resolution;
  setResolution: (res: Resolution) => void;
  quality: Quality;
  setQuality: (q: Quality) => void;
  useGrounding: boolean;
  setUseGrounding: (use: boolean) => void;
}

function SegmentGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex w-full rounded-md border border-hairline bg-canvas">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors",
            value === opt ? "bg-primary text-on-primary" : "text-body hover:text-ink",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/** Gemini / OpenAI 专属生成参数面板：思考强度、分辨率、检索增强、画质。 */
export function SettingsPanel({
  showGeminiOptions,
  showQuality,
  thinkingLevel,
  setThinkingLevel,
  resolution,
  setResolution,
  quality,
  setQuality,
  useGrounding,
  setUseGrounding,
}: SettingsPanelProps) {
  const { open, toggle, style, triggerRef, panelRef } = useFloatingPanel("end");

  const panel = open && (
    <div
      ref={panelRef}
      style={{ position: "fixed", top: style.top, left: style.left, width: 256, zIndex: 9999 }}
      className="space-y-3 rounded-lg border border-hairline bg-card p-3 shadow-lg"
    >
      {showGeminiOptions && (
        <>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium tracking-wide text-muted uppercase">思考强度</label>
            <p className="text-[10px] text-muted-soft">生成前模型推理的程度</p>
            <SegmentGroup value={thinkingLevel} options={["minimal", "high"] as const} onChange={setThinkingLevel} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium tracking-wide text-muted uppercase">分辨率</label>
            <p className="text-[10px] text-muted-soft">输出图片的尺寸</p>
            <SegmentGroup value={resolution} options={["1K", "2K", "4K"] as const} onChange={setResolution} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium tracking-wide text-muted uppercase">检索增强</label>
            <p className="text-[10px] text-muted-soft">用实时网络搜索结果辅助生成</p>
            <button
              type="button"
              onClick={() => setUseGrounding(!useGrounding)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                useGrounding
                  ? "border-primary bg-primary text-on-primary"
                  : "border-hairline bg-canvas text-body hover:border-muted-soft",
              )}
            >
              <Search size={13} className="shrink-0" />
              <span>Google 搜索</span>
            </button>
          </div>
        </>
      )}
      {showQuality && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium tracking-wide text-muted uppercase">画质</label>
          <p className="text-[10px] text-muted-soft">画质越高消耗算力越多</p>
          <SegmentGroup value={quality} options={["auto", "low", "medium", "high"] as const} onChange={setQuality} />
        </div>
      )}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label="生成设置"
        aria-expanded={open}
        className={cn(
          "flex h-7 items-center justify-center rounded-md border border-hairline bg-card px-2 text-muted transition-colors hover:border-muted-soft hover:text-ink md:h-9",
          open && "border-secondary text-ink",
        )}
      >
        <Settings size={15} />
      </button>
      {typeof document !== "undefined" && panel && createPortal(panel, document.body)}
    </>
  );
}
