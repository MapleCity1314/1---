"use client";

import { Button } from "@/components/ui";
import { useEffect, useRef, useState } from "react";

interface ProgressBarProps {
  progress: number;
  phase?: "sending" | "generating" | "processing" | "loading";
  onCancel: () => void;
}

function useElapsedSeconds() {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return elapsed;
}

function getStatusMessage(elapsed: number): string | null {
  if (elapsed < 45) return null;
  return "模型处理时间比预期长，请稍候";
}

export function ProgressBar({ progress, onCancel }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(progress); // 从当前值起步，不从 0 开始动画
  const animationRef = useRef<number | undefined>(undefined);
  const elapsed = useElapsedSeconds();
  const statusMessage = getStatusMessage(elapsed);

  useEffect(() => {
    const animate = () => {
      if (!barRef.current) return;
      const diff = progress - currentRef.current;
      const step = diff * 0.08;

      if (Math.abs(diff) > 0.01) {
        currentRef.current += step;
        barRef.current.style.width = `${currentRef.current}%`;
        animationRef.current = requestAnimationFrame(animate);
      } else {
        currentRef.current = progress;
        barRef.current.style.width = `${progress}%`;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [progress]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-4 select-none">
      <div className="w-full max-w-md rounded-xl border border-hairline bg-card/95 p-4 shadow-lg backdrop-blur-sm">
        {/* 像素网格进度条，呼应背景的抖动着色效果 */}
        <div className="relative mb-3 h-[6px] overflow-hidden rounded-full border border-hairline bg-surface-card md:h-[8px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(31,30,30,0.06) 2px, transparent 2px),
                linear-gradient(to bottom, rgba(31,30,30,0.06) 2px, transparent 2px)
              `,
              backgroundSize: "3px 3px",
            }}
          />
          <div
            ref={barRef}
            className="absolute top-0 left-0 h-full bg-primary"
            style={{
              width: `${progress}%`,
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.15) 2px, transparent 2px),
                linear-gradient(to bottom, rgba(255,255,255,0.15) 2px, transparent 2px)
              `,
              backgroundSize: "3px 3px",
            }}
          />
        </div>

        <p className="mb-3 text-center text-xs text-muted tabular-nums">{Math.round(progress)}%</p>

        {statusMessage && (
          <p className="mb-2 animate-pulse text-center text-xs text-muted">{statusMessage}</p>
        )}
        <div className="text-center">
          <Button onClick={onCancel} variant="secondary" className="h-7 px-3 text-xs">
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}
