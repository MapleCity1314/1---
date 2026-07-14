"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Loader, Sparkles } from "@/components/icons";

/**
 * 手动生成研报：非流式请求（对齐 studio 图片生成），点击后转圈等待，
 * 结果落库后直接跳到详情页。可选带一句「关键节点」说明（如"美联储议息"），
 * 带说明时后端会把 scope 记成 event，否则记成 manual。
 */
export function GenerateBriefButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [eventNote, setEventNote] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/briefs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventNote: eventNote.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      setOpen(false);
      setEventNote("");
      router.push(`/briefs/${data.brief.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <Button onClick={() => setOpen((v) => !v)} disabled={loading}>
        {loading ? <Loader size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {loading ? "生成中…" : "生成研报"}
      </Button>

      {open && !loading && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-hairline bg-card p-4 shadow-lg">
            <label className="mb-1.5 block text-sm font-medium text-body-strong">
              关键节点说明（可选）
            </label>
            <input
              value={eventNote}
              onChange={(e) => setEventNote(e.target.value)}
              placeholder="如：美联储议息、CPI 数据公布"
              className="mb-3 h-9 w-full rounded-md border border-hairline bg-card px-3 text-sm text-ink outline-none placeholder:text-muted-soft focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            {error && <p className="mb-2 text-xs text-error">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button onClick={generate}>确认生成</Button>
            </div>
            <p className="mt-2 text-xs text-muted-soft">
              留空则生成常规研报；填写后会围绕该节点生成研报。
            </p>
          </div>
        </>
      )}
    </div>
  );
}
