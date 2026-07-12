"use client";

import type React from "react";
import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, ImagePlus } from "@/components/icons";

interface ImageUploadBoxProps {
  imageNumber: 1 | 2;
  preview: string | null;
  onDrop: (e: React.DragEvent) => void;
  onClear: () => void;
  onSelect: () => void;
}

export const ImageUploadBox = memo(function ImageUploadBox({
  imageNumber,
  preview,
  onDrop,
  onClear,
  onSelect,
}: ImageUploadBoxProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    },
    [onSelect],
  );

  const handleClearClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClear();
    },
    [onClear],
  );

  return (
    <div
      className={cn(
        "relative flex h-[60px] w-full cursor-pointer items-center justify-center rounded-md border border-hairline bg-canvas transition-colors sm:h-[80px] md:h-[100px] lg:h-[12vh] xl:h-[14vh]",
        "hover:border-muted-soft",
        preview && "border-primary",
      )}
      onDrop={onDrop}
      onDragOver={handleDragOver}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`上传图片 ${imageNumber}`}
      onKeyDown={handleKeyDown}
    >
      {preview ? (
        <div className="relative h-full w-full p-1 sm:p-2">
          <button
            onClick={handleClearClick}
            className="absolute top-0.5 right-0.5 z-10 rounded-full bg-card p-1 text-muted shadow-sm transition-colors hover:bg-surface-card hover:text-ink sm:top-1 sm:right-1 sm:p-1.5"
            aria-label={`清除图片 ${imageNumber}`}
          >
            <X size={13} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- 本地 data URL 预览，无需 next/image 优化 */}
          <img src={preview} alt={`图片 ${imageNumber}`} className="h-full w-full object-contain" />
        </div>
      ) : (
        <div className="py-1 text-center text-muted sm:py-4">
          <ImagePlus size={18} className="mx-auto mb-1" />
          <p className="text-xs">{imageNumber === 1 ? "上传图片" : "第二张图片"}</p>
          <p className="mt-0.5 hidden text-[10px] text-muted-soft lg:block">（或拖拽到此处）</p>
        </div>
      )}
    </div>
  );
});
