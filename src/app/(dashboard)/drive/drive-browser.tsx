"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DriveNode } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Folder,
  FolderPlus,
  File,
  FileText,
  FileSpreadsheet,
  FileSlides,
  Upload,
  Pencil,
  Trash,
  Loader,
  ChevronRight,
} from "@/components/icons";
import { Button, Input } from "@/components/ui";
import { uploadDriveFile } from "@/lib/drive-upload";
import {
  createFolderAction,
  registerFileAction,
  renameNodeAction,
  deleteNodeAction,
} from "./actions";
import { FileModal } from "./viewers/file-modal";

/**
 * 文档库主视图：面包屑 + 工具栏（上传/新建文件夹） + 节点网格。
 * 目录导航靠改 URL 的 ?folder= 参数（服务端 page.tsx 据此重新查询），
 * 不用客户端维护一份平行的目录状态。
 */
export function DriveBrowser({
  nodes,
  breadcrumb,
  currentFolderId,
}: {
  nodes: DriveNode[];
  breadcrumb: DriveNode[];
  currentFolderId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [openFile, setOpenFile] = useState<DriveNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(() => nodes, [nodes]);

  function goto(folderId: string | null) {
    startTransition(() => {
      router.push(folderId ? `/drive?folder=${folderId}` : "/drive");
    });
  }

  function openNode(node: DriveNode) {
    if (node.kind === "folder") goto(node.id);
    else setOpenFile(node);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    for (const file of Array.from(files)) {
      const res = await uploadDriveFile(file);
      if (!res.ok) {
        setError(res.error);
        continue;
      }
      const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
      const fd = new FormData();
      fd.set("name", file.name);
      fd.set("parent_id", currentFolderId ?? "");
      fd.set("storage_path", res.storagePath);
      fd.set("mime_type", file.type);
      fd.set("ext", ext);
      fd.set("size", String(res.size));
      const result = await registerFileAction(fd);
      if (result?.error) setError(result.error);
    }
    setUploading(false);
    router.refresh();
  }

  async function submitFolder() {
    const name = folderName.trim();
    if (!name) {
      setCreatingFolder(false);
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("parent_id", currentFolderId ?? "");
    const result = await createFolderAction(null, fd);
    if (result?.error) setError(result.error);
    setFolderName("");
    setCreatingFolder(false);
    router.refresh();
  }

  async function submitRename(id: string) {
    const name = renameValue.trim();
    setRenamingId(null);
    if (!name) return;
    setError(null);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("name", name);
    const result = await renameNodeAction(fd);
    if (result?.error) setError(result.error);
    router.refresh();
  }

  async function remove(node: DriveNode) {
    const msg =
      node.kind === "folder"
        ? `确定删除文件夹「${node.name}」及其中所有内容？此操作不可撤销。`
        : `确定删除「${node.name}」？此操作不可撤销。`;
    if (!confirm(msg)) return;
    const fd = new FormData();
    fd.set("id", node.id);
    await deleteNodeAction(fd);
    router.refresh();
  }

  return (
    <div>
      {/* 面包屑 */}
      <div className="mb-4 flex items-center gap-1 text-sm">
        <button
          onClick={() => goto(null)}
          className={cn(
            "rounded px-1.5 py-0.5 hover:bg-surface-soft",
            currentFolderId === null ? "text-ink font-medium" : "text-muted",
          )}
        >
          全部文件
        </button>
        {breadcrumb.map((b) => (
          <span key={b.id} className="flex items-center gap-1">
            <ChevronRight size={13} className="text-muted-soft" />
            <button
              onClick={() => goto(b.id)}
              className={cn(
                "rounded px-1.5 py-0.5 hover:bg-surface-soft",
                b.id === currentFolderId ? "text-ink font-medium" : "text-muted",
              )}
            >
              {b.name}
            </button>
          </span>
        ))}
      </div>

      {/* 工具栏 */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader size={15} className="animate-spin" /> : <Upload size={15} />}
          上传文件
        </Button>
        {creatingFolder ? (
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submitFolder();
                if (e.key === "Escape") {
                  setCreatingFolder(false);
                  setFolderName("");
                }
              }}
              onBlur={() => void submitFolder()}
              placeholder="文件夹名称"
              className="h-9 w-44"
            />
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setCreatingFolder(true)}>
            <FolderPlus size={15} />
            新建文件夹
          </Button>
        )}
        {pending && <Loader size={15} className="animate-spin text-muted" />}
        <span className="ml-auto text-sm text-muted">共 {sorted.length} 项</span>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
      )}

      {/* 节点网格 */}
      {sorted.length === 0 ? (
        <div
          className="rounded-[22px] border border-dashed border-hairline-strong bg-card py-20 text-center text-muted card-shadow"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleFiles(e.dataTransfer.files);
          }}
        >
          这里还没有文件，上传或拖拽文件到此处
        </div>
      ) : (
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleFiles(e.dataTransfer.files);
          }}
        >
          {sorted.map((node) => (
            <div
              key={node.id}
              className="group relative flex flex-col items-center gap-2 rounded-2xl border border-hairline bg-card px-3 py-5 card-shadow hover:border-muted-soft"
            >
              <button
                onClick={() => openNode(node)}
                className="flex flex-col items-center gap-2"
              >
                <NodeIcon node={node} />
                {renamingId === node.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void submitRename(node.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    onBlur={() => void submitRename(node.id)}
                    className="w-full rounded border border-hairline bg-card px-1 text-center text-xs text-ink outline-none"
                  />
                ) : (
                  <span
                    className="max-w-[110px] truncate text-center text-xs text-ink"
                    title={node.name}
                  >
                    {node.name}
                  </span>
                )}
              </button>

              <div className="absolute right-1.5 top-1.5 hidden items-center gap-0.5 group-hover:flex">
                <button
                  onClick={() => {
                    setRenamingId(node.id);
                    setRenameValue(node.name);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-surface-card hover:text-ink"
                  title="重命名"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => void remove(node)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-error/10 hover:text-error"
                  title="删除"
                >
                  <Trash size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {openFile && (
        <FileModal key={openFile.id} node={openFile} onClose={() => setOpenFile(null)} />
      )}
    </div>
  );
}

function NodeIcon({ node }: { node: DriveNode }) {
  if (node.kind === "folder") return <Folder size={34} className="text-amber" />;
  const ext = node.ext ?? "";
  if (["xlsx", "xls", "csv"].includes(ext))
    return <FileSpreadsheet size={34} className="text-success" />;
  if (["pptx", "ppt"].includes(ext)) return <FileSlides size={34} className="text-warning" />;
  if (["txt", "md", "json", "ts", "tsx", "js", "jsx", "css", "html", "yml", "yaml"].includes(ext))
    return <FileText size={34} className="text-secondary" />;
  return <File size={34} className="text-muted" />;
}
