"use client";

import { useEffect, useState } from "react";
import type { DriveNode } from "@/lib/types";
import { X, Loader, AlertTriangle, Download } from "@/components/icons";
import {
  IMAGE_EXTS,
  TEXT_EDIT_EXTS,
  SHEET_EXTS,
  DOCX_EXTS,
  SLIDES_EXTS,
  PDF_EXTS,
} from "./ext-groups";
import { getFileSignedUrlAction } from "../actions";
import { ImageViewer } from "./image-viewer";
import { PdfViewer } from "./pdf-viewer";
import { MonacoEditorViewer } from "./monaco-editor-viewer";
import { SheetEditorViewer } from "./sheet-editor-viewer";
import { DocxViewer } from "./docx-viewer";
import { OfficeOnlineViewer } from "./office-online-viewer";

/**
 * 文件预览/编辑的统一入口：先换一个短时签名 URL，再按扩展名分发到
 * 对应 viewer/editor。所有 viewer 共享同一个全屏弹层外壳。
 */
export function FileModal({ node, onClose }: { node: DriveNode; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    getFileSignedUrlAction(node.id).then((res) => {
      if (!active) return;
      if ("error" in res) setError(res.error);
      else setUrl(res.url);
    });
    return () => {
      active = false;
    };
    // node.id 是 FileModal 的 key，切换文件时组件会整体重挂载，
    // 这里不需要也不应该同步重置 url/error（会触发 set-state-in-effect 告警）。
  }, [node.id]);

  const ext = node.ext ?? "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={node.name}
    >
      <div
        className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-hairline bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
          <h2 className="truncate text-sm font-medium text-ink" title={node.name}>
            {node.name}
          </h2>
          <div className="flex items-center gap-1">
            {url && (
              <a
                href={url}
                download={node.name}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-soft hover:text-ink"
                title="下载"
              >
                <Download size={16} />
              </a>
            )}
            <button
              onClick={onClose}
              aria-label="关闭"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-soft hover:text-ink"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {error ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-error">
              <AlertTriangle size={16} />
              {error}
            </div>
          ) : !url ? (
            <div className="flex h-full items-center justify-center text-muted">
              <Loader size={20} className="animate-spin" />
            </div>
          ) : IMAGE_EXTS.includes(ext) ? (
            <ImageViewer url={url} name={node.name} />
          ) : PDF_EXTS.includes(ext) ? (
            <PdfViewer url={url} />
          ) : TEXT_EDIT_EXTS.includes(ext) ? (
            <MonacoEditorViewer node={node} url={url} />
          ) : SHEET_EXTS.includes(ext) ? (
            <SheetEditorViewer node={node} url={url} />
          ) : DOCX_EXTS.includes(ext) ? (
            <DocxViewer url={url} />
          ) : SLIDES_EXTS.includes(ext) ? (
            <OfficeOnlineViewer url={url} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted">
              <p>暂不支持预览此类型文件</p>
              <a href={url} download={node.name} className="text-secondary hover:underline">
                下载文件
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
