"use client";

import { cn } from "@/lib/utils";
import { ImagePlus } from "@/components/icons";

interface GlobalDropZoneProps {
  dropZoneHover: 1 | 2 | null;
  onSetDropZoneHover: (zone: 1 | 2 | null) => void;
  onDrop: (e: React.DragEvent, slot?: 1 | 2) => void;
}

export function GlobalDropZone({ dropZoneHover, onSetDropZoneHover, onDrop }: GlobalDropZoneProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center gap-8 bg-ink/80 px-8 backdrop-blur-sm"
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e, 1);
      }}
    >
      <div
        className={cn(
          "h-64 max-w-md flex-1 cursor-pointer rounded-xl border-4 border-dashed p-8 text-center transition-all duration-200",
          dropZoneHover === 1
            ? "scale-105 border-white bg-white/30 shadow-2xl shadow-white/50"
            : "border-white/50 bg-white/5 hover:border-white/70 hover:bg-white/10",
        )}
        onDragEnter={() => onSetDropZoneHover(1)}
        onDragLeave={() => onSetDropZoneHover(null)}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDrop(e, 1);
        }}
      >
        <div className="flex h-full flex-col items-center justify-center">
          <div
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all",
              dropZoneHover === 1 ? "scale-110 bg-white/40" : "bg-white/10",
            )}
          >
            <span className={cn("text-3xl font-bold transition-all", dropZoneHover === 1 ? "text-white" : "text-white/80")}>
              1
            </span>
          </div>
          <ImagePlus
            size={44}
            className={cn("mx-auto mb-4 transition-all", dropZoneHover === 1 ? "scale-110 text-white" : "text-white/80")}
          />
          <p className={cn("text-xl font-bold transition-all", dropZoneHover === 1 ? "text-white" : "text-white/80")}>
            输入 1
          </p>
          <p className={cn("mt-2 text-sm transition-all", dropZoneHover === 1 ? "text-white/90" : "text-white/70")}>
            拖拽到此处放入第一张图片
          </p>
        </div>
      </div>

      <div
        className={cn(
          "h-64 max-w-md flex-1 cursor-pointer rounded-xl border-4 border-dashed p-8 text-center transition-all duration-200",
          dropZoneHover === 2
            ? "scale-105 border-white bg-white/30 shadow-2xl shadow-white/50"
            : "border-white/50 bg-white/5 hover:border-white/70 hover:bg-white/10",
        )}
        onDragEnter={() => onSetDropZoneHover(2)}
        onDragLeave={() => onSetDropZoneHover(null)}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDrop(e, 2);
        }}
      >
        <div className="flex h-full flex-col items-center justify-center">
          <div
            className={cn(
              "mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all",
              dropZoneHover === 2 ? "scale-110 bg-white/40" : "bg-white/10",
            )}
          >
            <span className={cn("text-3xl font-bold transition-all", dropZoneHover === 2 ? "text-white" : "text-white/80")}>
              2
            </span>
          </div>
          <ImagePlus
            size={44}
            className={cn("mx-auto mb-4 transition-all", dropZoneHover === 2 ? "scale-110 text-white" : "text-white/80")}
          />
          <p className={cn("text-xl font-bold transition-all", dropZoneHover === 2 ? "text-white" : "text-white/80")}>
            输入 2
          </p>
          <p className={cn("mt-2 text-sm transition-all", dropZoneHover === 2 ? "text-white/90" : "text-white/70")}>
            拖拽到此处放入第二张图片
          </p>
        </div>
      </div>
    </div>
  );
}
