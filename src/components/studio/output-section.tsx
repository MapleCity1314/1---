"use client";

import { memo, useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress-bar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Pin, PinOff, ImageOff } from "@/components/icons";
import type { Generation } from "./types";

interface OutputSectionProps {
  selectedGeneration: Generation | undefined;
  generations: Generation[];
  selectedGenerationId: string | null;
  setSelectedGenerationId: (id: string) => void;
  imageLoaded: boolean;
  setImageLoaded: (loaded: boolean) => void;
  onCancelGeneration: (id: string) => void;
  onDeleteGeneration: (id: string) => void;
  onOpenFullscreen: () => void;
  onLoadAsInput: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onOpenInNewTab: () => void;
  onImageReady: (id: string) => void;
}

const ActionButtons = memo(function ActionButtons({
  disabled,
  onLoadAsInput,
  onCopy,
  onDownload,
  pinned,
  onTogglePin,
}: {
  disabled: boolean;
  onLoadAsInput: () => void;
  onCopy: () => void;
  onDownload: () => void;
  pinned: boolean;
  onTogglePin: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Button
        onClick={onLoadAsInput}
        disabled={disabled}
        variant="secondary"
        className="h-7 gap-1 border-white/20 bg-black/70 px-2 text-xs text-white backdrop-blur-sm hover:bg-black/90"
        title="用作输入"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline">用作输入</span>
      </Button>
      <Button
        onClick={onCopy}
        disabled={disabled}
        variant="secondary"
        className="h-7 gap-1 border-white/20 bg-black/70 px-2 text-xs text-white backdrop-blur-sm hover:bg-black/90"
        title="复制到剪贴板"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
        </svg>
        <span className="hidden sm:inline">复制</span>
      </Button>
      <Button
        onClick={onDownload}
        disabled={disabled}
        variant="secondary"
        className="h-7 gap-1 border-white/20 bg-black/70 px-2 text-xs text-white backdrop-blur-sm hover:bg-black/90"
        title="下载图片"
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span className="hidden sm:inline">下载</span>
      </Button>
      <Button
        onClick={onTogglePin}
        variant="secondary"
        className={cn(
          "hidden h-7 gap-1 px-2 text-xs backdrop-blur-sm md:flex",
          pinned
            ? "border-white bg-white text-black hover:bg-gray-200"
            : "border-white/20 bg-black/70 text-white hover:bg-black/90",
        )}
        title={pinned ? "取消固定" : "固定工具栏"}
      >
        {pinned ? <PinOff size={14} /> : <Pin size={14} />}
      </Button>
    </div>
  );
});

export const OutputSection = memo(function OutputSection({
  selectedGeneration,
  generations,
  selectedGenerationId,
  setSelectedGenerationId,
  setImageLoaded,
  onCancelGeneration,
  onOpenFullscreen,
  onLoadAsInput,
  onCopy,
  onDownload,
  onImageReady,
}: OutputSectionProps) {
  useIsMobile();
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    try {
      setPinned(localStorage.getItem("toolbar_pinned") === "true");
    } catch {}
  }, []);
  const togglePin = useCallback(() => {
    setPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("toolbar_pinned", String(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTyping = activeElement?.tagName === "TEXTAREA" || activeElement?.tagName === "INPUT";

      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !isTyping) {
        if (generations.length <= 1) return;

        e.preventDefault();
        const currentIndex = generations.findIndex((g) => g.id === selectedGenerationId);
        if (currentIndex === -1 && generations.length > 0) {
          setSelectedGenerationId(generations[0].id);
          return;
        }

        const newIndex = e.key === "ArrowLeft" ? currentIndex - 1 : currentIndex + 1;
        if (newIndex >= 0 && newIndex < generations.length) {
          setSelectedGenerationId(generations[newIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generations, selectedGenerationId, setSelectedGenerationId]);

  // 只要有 URL 就渲染图片(即便还在 loading)——图片会在进度条下方解码完成
  const imageUrl = selectedGeneration?.imageUrl || null;
  const isComplete = selectedGeneration?.status === "complete";
  const isLoading = selectedGeneration?.status === "loading";

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    // 仍是 loading 状态时说明图片刚在进度条下方解码完成，通知外层可以隐藏进度条了
    if (selectedGeneration?.status === "loading" && selectedGeneration.id) {
      onImageReady(selectedGeneration.id);
    }
  }, [setImageLoaded, selectedGeneration?.status, selectedGeneration?.id, onImageReady]);

  const handleCancel = useCallback(() => {
    if (selectedGeneration) {
      onCancelGeneration(selectedGeneration.id);
    }
  }, [selectedGeneration, onCancelGeneration]);

  const hasImage = isComplete && !!imageUrl && generations.length > 0;

  return (
    <div className="group/output relative flex h-full min-h-0 flex-col select-none">
      <div className="relative flex flex-1 flex-col">
        {/* 图片层 —— 只要有 URL 就渲染，即便还在 loading，用来在进度条移除前先解码完毕 */}
        {imageUrl && (
          <div className="absolute inset-0 flex flex-col select-none">
            <div className="relative flex max-h-full max-w-full flex-1 items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- 生成结果图片来自 Supabase Storage 或 base64，域名随部署环境变化，无法静态配置 next/image remotePatterns */}
              <img
                src={imageUrl}
                alt={`生成结果：${selectedGeneration?.prompt || ""}`}
                fetchPriority="high"
                className="max-h-full max-w-full cursor-pointer lg:h-full lg:w-full lg:object-contain"
                onLoad={handleImageLoad}
                onClick={isComplete ? onOpenFullscreen : undefined}
              />

              {/* 操作按钮 —— 仅在生成完成后显示 */}
              {hasImage && (
                <div
                  className={cn(
                    "absolute bottom-3 left-1/2 z-10 -translate-x-1/2 transition-all duration-200",
                    "md:translate-y-2 md:opacity-0",
                    pinned
                      ? "md:translate-y-0 md:opacity-100"
                      : "md:group-hover/output:translate-y-0 md:group-hover/output:opacity-100",
                  )}
                >
                  <ActionButtons
                    disabled={!isComplete}
                    onLoadAsInput={onLoadAsInput}
                    onCopy={onCopy}
                    onDownload={onDownload}
                    pinned={pinned}
                    onTogglePin={togglePin}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 进度条覆盖层 —— loading 时叠在图片上方 */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink/10">
            <ProgressBar
              progress={selectedGeneration.progress}
              phase={selectedGeneration.phase || "sending"}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* 空状态 —— 未选中任何生成结果 */}
        {!selectedGeneration && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-soft py-6 text-center select-none">
            <div>
              <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-card md:h-16 md:w-16">
                <ImageOff size={16} className="text-muted-soft md:h-8 md:w-8" />
              </div>
              <p className="py-1 text-xs font-medium text-muted md:py-2">就绪，可以生成</p>
            </div>
          </div>
        )}

        {/* 已完成但没有图片的兜底情况(理论上不会出现，做个安全处理) */}
        {selectedGeneration && !imageUrl && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-soft py-6 text-center select-none">
            <div>
              <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-card md:h-16 md:w-16">
                <ImageOff size={16} className="text-muted-soft md:h-8 md:w-8" />
              </div>
              <p className="py-1 text-xs font-medium text-muted md:py-2">就绪，可以生成</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
