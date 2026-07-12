"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import type { DriveNode } from "@/lib/types";
import { Button, Input } from "@/components/ui";
import { Loader, Plus } from "@/components/icons";
import { overwriteDriveFile } from "@/lib/drive-upload";
import { saveFileContentAction } from "../actions";

type Grid = string[][];

/**
 * xlsx/csv 真编辑：用 SheetJS 读出第一个 sheet 转成二维数组渲染可编辑表格，
 * 保存时用 SheetJS 写回同格式（xlsx 走 xlsx bookType，csv 走 csv），
 * 覆盖 Storage 原对象。不做多 sheet / 公式 / 样式，只覆盖「填数据表」这个
 * 最常见场景——够用，且不需要引入完整的表格编辑器依赖。
 */
export function SheetEditorViewer({ node, url }: { node: DriveNode; url: string }) {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isCsv = node.ext === "csv";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("下载文件失败");
        const buf = await res.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, {
          header: 1,
          defval: "",
          raw: false,
        });
        if (!cancelled) setGrid(rows.length > 0 ? (rows as Grid) : [[""]]);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "解析表格失败");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  const colCount = useMemo(
    () => (grid ? Math.max(1, ...grid.map((r) => r.length)) : 1),
    [grid],
  );

  function setCell(r: number, c: number, value: string) {
    setGrid((prev) => {
      if (!prev) return prev;
      const next = prev.map((row) => [...row]);
      while (next[r].length <= c) next[r].push("");
      next[r][c] = value;
      return next;
    });
  }

  function addRow() {
    setGrid((prev) => (prev ? [...prev, Array(colCount).fill("")] : prev));
  }

  function addCol() {
    setGrid((prev) => (prev ? prev.map((row) => [...row, ""]) : prev));
  }

  async function save() {
    if (!grid || !node.storage_path) return;
    setSaving(true);
    setError(null);
    try {
      const ws = XLSX.utils.aoa_to_sheet(grid);
      let blob: Blob;
      let contentType: string;
      if (isCsv) {
        const csv = XLSX.utils.sheet_to_csv(ws);
        blob = new Blob([csv], { type: "text/csv" });
        contentType = "text/csv";
      } else {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        contentType = blob.type;
      }
      const res = await overwriteDriveFile(node.storage_path, blob, contentType);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const fd = new FormData();
      fd.set("id", node.id);
      fd.set("size", String(res.size));
      const result = await saveFileContentAction(fd);
      if (result?.error) setError(result.error);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (error && !grid) {
    return <p className="p-6 text-sm text-error">{error}</p>;
  }
  if (!grid) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <Loader size={20} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-2">
        <Button variant="secondary" onClick={addRow}>
          <Plus size={14} />
          行
        </Button>
        <Button variant="secondary" onClick={addCol}>
          <Plus size={14} />
          列
        </Button>
        <Button onClick={() => void save()} disabled={saving} className="ml-auto">
          {saving ? <Loader size={14} className="animate-spin" /> : null}
          {saved ? "已保存" : saving ? "保存中…" : "保存"}
        </Button>
      </div>
      {error && <p className="px-4 py-1.5 text-xs text-error">{error}</p>}
      <div className="flex-1 overflow-auto p-3">
        <table className="border-collapse text-sm">
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                {Array.from({ length: colCount }).map((_, c) => (
                  <td key={c} className="border border-hairline p-0">
                    <Input
                      value={row[c] ?? ""}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      className="h-8 w-32 rounded-none border-none focus:ring-1"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
