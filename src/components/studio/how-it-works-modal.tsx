"use client";

import { useEffect } from "react";
import { X } from "@/components/icons";
import { MODEL_CATALOG } from "./model-catalog";

interface HowItWorksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 简单的自建弹层，不依赖 radix Dialog——固定遮罩 + 居中卡片，Esc/点击遮罩关闭。
export function HowItWorksModal({ open, onOpenChange }: HowItWorksModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
      aria-label="使用说明"
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl border border-hairline bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h2 className="text-lg font-semibold text-ink">使用说明</h2>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="关闭"
            className="rounded-full p-1 text-muted transition-colors hover:bg-surface-soft hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(80vh-64px)] space-y-6 overflow-y-auto px-5 py-4 text-sm text-body">
          <div>
            <p className="leading-relaxed">
              AI 绘图工作台可以文生图，也可以基于已有图片做编辑或合图。所有请求都通过 AI Gateway
              统一路由到各家模型服务商。
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-body-strong">支持的模型</h3>
            <ul className="ml-2 list-inside list-disc space-y-1.5">
              {Object.entries(
                MODEL_CATALOG.reduce<Record<string, string[]>>((acc, m) => {
                  (acc[m.provider] ||= []).push(m.name);
                  return acc;
                }, {}),
              ).map(([provider, names]) => (
                <li key={provider}>
                  <span className="font-medium text-body-strong">{provider}：</span>
                  {names.join("、")}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-body-strong">模型设置</h3>
            <ul className="ml-2 list-inside list-disc space-y-1.5">
              <li>
                <span className="font-medium text-body-strong">GPT Image 画质：</span>
                自动 / 低 / 中 / 高，画质越高耗时越长
              </li>
              <li>
                <span className="font-medium text-body-strong">Gemini 3.1 Flash：</span>
                思考深度（简洁/深入）、分辨率最高 4K，以及联网搜索增强
              </li>
              <li>
                <span className="font-medium text-body-strong">画面比例：</span>
                选择器只展示当前模型支持的比例；切换模型或拖入图片时会自动匹配最接近的比例
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-body-strong">技术说明</h3>
            <ul className="ml-2 list-inside list-disc space-y-1.5">
              <li>登录后即可使用，请求由服务端接口同步处理并等待结果返回</li>
              <li>图片编辑前会在浏览器端做格式与大小校验，再转换后提交</li>
              <li>生成结果保存在 Supabase Storage，不加水印；历史记录列表保存在本机浏览器</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-body-strong">图片编辑</h3>
            <p className="mb-1.5 leading-relaxed">上传一张或两张原图，配合编辑指令使用：</p>
            <ul className="ml-2 list-inside list-disc space-y-1">
              <li>拖拽图片或点击选择文件</li>
              <li>也可以直接粘贴图片链接</li>
              <li>支持 PNG / JPG / WebP / GIF，单张最大 50MB</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-base font-semibold text-body-strong">快捷键</h3>
            <ul className="ml-2 list-inside list-disc space-y-1">
              <li>
                <kbd className="rounded bg-surface-soft px-1.5 py-0.5 text-xs">⌘/Ctrl + Enter</kbd> 生成图片
              </li>
              <li>
                <kbd className="rounded bg-surface-soft px-1.5 py-0.5 text-xs">⌘/Ctrl + C</kbd> 复制图片到剪贴板
              </li>
              <li>
                <kbd className="rounded bg-surface-soft px-1.5 py-0.5 text-xs">⌘/Ctrl + D</kbd> 下载图片
              </li>
              <li>
                <kbd className="rounded bg-surface-soft px-1.5 py-0.5 text-xs">⌘/Ctrl + U</kbd> 将生成结果用作输入
              </li>
              <li>
                <kbd className="rounded bg-surface-soft px-1.5 py-0.5 text-xs">Esc</kbd> 关闭全屏预览
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
