"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 通用浮层定位 + 外部点击关闭逻辑，用 createPortal 挂到 document.body。
 * 供模型选择器 / 比例选择器 / 设置面板等下拉复用，替代 radix Popover/Select。
 */
export function useFloatingPanel(align: "start" | "end" = "start") {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<{ top: number; left: number; minWidth: number }>({
    top: 0,
    left: 0,
    minWidth: 200,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setStyle({
      top: rect.bottom + 6,
      left: align === "end" ? rect.right - Math.max(200, rect.width) : rect.left,
      minWidth: Math.max(200, rect.width),
    });
  }, [align]);

  const toggle = useCallback(() => {
    updatePosition();
    setOpen((o) => !o);
  }, [updatePosition]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onScroll() {
      updatePosition();
    }
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  return { open, setOpen, toggle, style, triggerRef, panelRef };
}
