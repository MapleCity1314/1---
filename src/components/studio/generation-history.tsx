"use client";

import type React from "react";
import { memo, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Loader, X } from "@/components/icons";
import type { Generation } from "./types";

interface GenerationHistoryProps {
  generations: Generation[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
  onImageReady?: (id: string) => void;
  isLoading?: boolean;
  hasInitiallyLoaded?: boolean;
  className?: string;
  compact?: boolean;
}

const GenerationThumbnail = memo(function GenerationThumbnail({
  gen,
  index,
  isSelected,
  onSelect,
  onCancel,
  onDelete,
  onImageReady,
  deletingId,
  onDeleteClick,
}: {
  gen: Generation;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
  onImageReady?: (id: string) => void;
  deletingId: string | null;
  onDeleteClick: (e: React.MouseEvent, id: string) => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      onClick={() => onSelect(gen.id)}
      className={cn(
        "group relative h-18 w-18 flex-shrink-0 overflow-hidden rounded-md transition-all cursor-pointer md:h-24 md:w-24",
        isSelected ? "border-2 border-primary" : "border border-hairline hover:border-muted-soft",
        deletingId === gen.id && "pointer-events-none opacity-50",
      )}
      role="button"
      tabIndex={0}
      aria-label={`历史记录 ${index + 1}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(gen.id);
        }
      }}
    >
      {/* 图片层：只要有 URL 就渲染，即使还在 loading，也能在遮罩下先解码好 */}
      {gen.imageUrl && gen.status !== "error" && (
        <>
          {onDelete && gen.status === "complete" && (
            <button
              onClick={(e) => onDeleteClick(e, gen.id)}
              disabled={deletingId === gen.id}
              className="absolute top-1 right-1 z-10 rounded p-1 bg-card/90 text-muted opacity-0 transition-all hover:bg-error hover:text-white group-hover:opacity-100 disabled:opacity-50"
              aria-label="删除生成记录"
            >
              {deletingId === gen.id ? <Loader size={12} className="animate-spin" /> : <X size={12} />}
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element -- 生成结果图片来自 Supabase Storage 或 base64，域名随部署环境变化，无法静态配置 next/image remotePatterns */}
          <img
            src={gen.imageUrl}
            alt={gen.prompt || "生成的图片"}
            loading={index < 5 ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => {
              setImageLoaded(true);
              if (gen.status === "loading") onImageReady?.(gen.id);
            }}
          />
          {gen.status === "complete" && !imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-surface-soft" />
          )}
        </>
      )}

      {/* loading 遮罩：进度 + 取消 */}
      {gen.status === "loading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface-dark/70">
          <span className="text-sm font-mono font-semibold text-on-dark md:text-base">
            {Math.round(gen.progress)}%
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel(gen.id);
            }}
            className="mt-2 rounded px-2 py-0.5 text-[10px] text-on-dark bg-white/10 transition-all hover:bg-white hover:text-black"
            aria-label="取消生成"
          >
            取消
          </button>
        </div>
      )}

      {/* 失败状态 */}
      {gen.status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-soft">
          <X size={20} className="text-muted-soft" />
          <span className="sr-only">生成失败</span>
          {onDelete && (
            <button
              onClick={(e) => onDeleteClick(e, gen.id)}
              disabled={deletingId === gen.id}
              className="absolute top-1 right-1 z-10 rounded p-1 bg-card/90 text-muted transition-all hover:bg-error hover:text-white disabled:opacity-50"
              aria-label="删除生成记录"
            >
              {deletingId === gen.id ? <Loader size={12} className="animate-spin" /> : <X size={12} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export const GenerationHistory = memo(function GenerationHistory({
  generations,
  selectedId,
  onSelect,
  onCancel,
  onDelete,
  onImageReady,
  hasInitiallyLoaded = false,
  className,
  compact = false,
}: GenerationHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleDelete = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!onDelete) return;

      setDeletingId(id);
      try {
        await onDelete(id);
      } catch (error) {
        console.error("删除生成记录失败:", error);
      } finally {
        setDeletingId(null);
      }
    },
    [onDelete],
  );

  return (
    <div className={cn("flex w-full flex-col", className)}>
      {!compact && <p className="mb-1 text-xs font-medium text-muted md:text-sm">历史记录</p>}
      <div
        ref={scrollContainerRef}
        className={cn(
          "flex h-20 w-full items-end gap-1.5 overflow-x-auto md:h-28",
          compact ? "pb-1" : "pb-2",
        )}
      >
        {generations.length === 0 && hasInitiallyLoaded ? (
          <div className="flex h-20 w-full items-center justify-center text-xs text-muted-soft md:h-28 md:text-sm">
            暂无生成记录
          </div>
        ) : (
          generations.map((gen, index) => (
            <GenerationThumbnail
              key={gen.id}
              gen={gen}
              index={index}
              isSelected={selectedId === gen.id}
              onSelect={onSelect}
              onCancel={onCancel}
              onDelete={onDelete}
              onImageReady={onImageReady}
              deletingId={deletingId}
              onDeleteClick={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
});
