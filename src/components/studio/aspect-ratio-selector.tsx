"use client";

import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { ChevronDown } from "@/components/icons";
import { useFloatingPanel } from "./hooks/use-floating-panel";
import type { AspectRatioOption } from "./types";

interface AspectRatioSelectorProps {
  value: string;
  options: AspectRatioOption[];
  onChange: (value: string) => void;
}

/** 比例选择器：createPortal 下拉，替代 radix Select。 */
export function AspectRatioSelector({ value, options, onChange }: AspectRatioSelectorProps) {
  const { open, setOpen, toggle, style, triggerRef, panelRef } = useFloatingPanel("end");
  const current = options.find((o) => o.value === value);

  const dropdown = open && (
    <div
      ref={panelRef}
      style={{ position: "fixed", top: style.top, left: style.left, minWidth: style.minWidth, zIndex: 9999 }}
      className="overflow-hidden rounded-lg border border-hairline bg-card py-1 shadow-lg"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            onChange(option.value);
            setOpen(false);
          }}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors",
            option.value === value ? "bg-surface-soft text-ink" : "text-body hover:bg-surface-soft",
          )}
        >
          <span className="hidden text-muted md:inline">{option.icon}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label="选择宽高比"
        aria-expanded={open}
        className={cn(
          "flex h-7 w-[72px] items-center gap-1 rounded-md border border-hairline bg-card px-2 text-xs text-ink transition-colors hover:border-muted-soft md:h-9 md:w-[100px] md:px-3 md:text-sm",
          open && "border-secondary",
        )}
      >
        <span className="flex-1 truncate text-left">{current?.label ?? "1:1"}</span>
        <ChevronDown size={13} className={cn("shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {typeof document !== "undefined" && dropdown && createPortal(dropdown, document.body)}
    </>
  );
}
