"use client";

import { useEffect, useState } from "react";
import { Loader, AlertTriangle } from "@/components/icons";

/**
 * docx 预览：用 mammoth 在浏览器端把 docx 转成 HTML，不出网、不依赖微软服务。
 * 只做只读展示（样式还原有限，不支持编辑），编辑需求走「下载改传」。
 */
export function DocxViewer({ url }: { url: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mammoth = await import("mammoth");
        const res = await fetch(url);
        if (!res.ok) throw new Error("文件下载失败");
        const buffer = await res.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        if (!cancelled) setHtml(result.value);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "文档解析失败");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-error">
        <AlertTriangle size={20} />
        {error}
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <Loader size={20} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-canvas px-6 py-6">
      <div
        className="prose prose-sm mx-auto max-w-3xl rounded-xl bg-card p-8 text-body card-shadow"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
