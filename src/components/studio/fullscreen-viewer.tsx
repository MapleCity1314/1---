"use client";

import { X, ChevronLeft, ChevronRight } from "@/components/icons";

interface FullscreenViewerProps {
  imageUrl: string;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  canNavigate: boolean;
}

export function FullscreenViewer({ imageUrl, onClose, onNavigate, canNavigate }: FullscreenViewerProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/95 backdrop-blur-sm select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="图片全屏预览"
    >
      {/* 关闭按钮 —— 固定在右上角 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="fixed top-4 right-4 z-50 p-1.5 text-white/60 transition-colors duration-200 hover:text-white"
        title="关闭 (ESC)"
        aria-label="关闭全屏预览"
      >
        <X size={20} strokeWidth={1.5} />
      </button>

      {/* 主体布局：箭头在图片外侧 */}
      <div className="flex h-full w-full items-center justify-center gap-4 px-12 py-8 md:gap-8 md:px-20">
        {/* 上一张 */}
        {canNavigate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("prev");
            }}
            className="fixed top-1/2 left-4 z-50 -translate-y-1/2 text-white/40 transition-colors duration-200 hover:text-white"
            title="上一张"
            aria-label="上一张图片"
          >
            <ChevronLeft size={22} strokeWidth={1.5} className="md:h-6 md:w-6" />
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element -- 全屏预览的图片来自 Supabase Storage 或 base64，域名随部署环境变化，无法静态配置 next/image remotePatterns */}
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="全屏预览"
          className="max-h-[90vh] max-w-full object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        {/* 下一张 */}
        {canNavigate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("next");
            }}
            className="fixed top-1/2 right-4 z-50 -translate-y-1/2 text-white/40 transition-colors duration-200 hover:text-white"
            title="下一张"
            aria-label="下一张图片"
          >
            <ChevronRight size={22} strokeWidth={1.5} className="md:h-6 md:w-6" />
          </button>
        )}
      </div>
    </div>
  );
}
