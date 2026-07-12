"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/** 简单的移动端断点检测：< 768px 视为移动端。SSR 阶段返回 undefined，
 * 客户端挂载后同步实际宽度，避免水合不一致。 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener("change", onChange);
    // 挂载后同步一次真实宽度：初始值必须是 undefined 才能避免水合不一致，
    // 所以这里的首次同步无法用惰性初始值替代
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
