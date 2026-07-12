"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { DriveNode } from "@/lib/types";
import { Loader, AlertTriangle } from "@/components/icons";
import { Button } from "@/components/ui";
import { overwriteDriveFile } from "@/lib/drive-upload";
import { saveFileContentAction } from "../actions";
import { monacoLanguageFor } from "./ext-groups";

// Monaco 依赖 window，禁 SSR；只在真正打开这类文件时才拉取这份体积不小的 bundle。
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-muted">
      <Loader size={20} className="animate-spin" />
    </div>
  ),
});

export function MonacoEditorViewer({ node, url }: { node: DriveNode; url: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("文件下载失败");
        const text = await res.text();
        if (!cancelled) setContent(text);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "文件加载失败");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  async function save() {
    if (content === null || !node.storage_path) return;
    setSaving(true);
    setError(null);
    const res = await overwriteDriveFile(node.storage_path, content, node.mime_type ?? "text/plain");
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    const fd = new FormData();
    fd.set("id", node.id);
    fd.set("size", String(res.size));
    const result = await saveFileContentAction(fd);
    if (result?.error) setError(result.error);
    else setDirty(false);
    setSaving(false);
  }

  if (error && content === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-error">
        <AlertTriangle size={20} />
        {error}
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <Loader size={20} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2">
        <span className="text-xs text-muted">
          {dirty ? "有未保存的修改" : "已保存"}
          {error && <span className="ml-2 text-error">{error}</span>}
        </span>
        <Button onClick={() => void save()} disabled={saving || !dirty}>
          {saving ? "保存中…" : "保存"}
        </Button>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={monacoLanguageFor(node.ext)}
          value={content}
          onChange={(v) => {
            setContent(v ?? "");
            setDirty(true);
          }}
          options={{ minimap: { enabled: false }, fontSize: 13 }}
        />
      </div>
    </div>
  );
}
