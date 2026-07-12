import { createClient } from "@/lib/supabase/client";

/**
 * 文档库文件上传：客户端直传到私有 drive 桶（RLS 已放开 authenticated
 * 读写，不需要签名上传 URL）。存储路径与文件夹树解耦——用随机路径，
 * 目录结构只活在 drive_nodes 表里，改名/移动都不用搬 Storage 对象。
 * 落库（写 drive_nodes 行）由调用方另外走 server action 完成。
 */

export const DRIVE_BUCKET = "drive";
export const MAX_DRIVE_FILE_MB = 50;

export type DriveUploadOk = { ok: true; storagePath: string; size: number };
export type DriveUploadErr = { ok: false; error: string };

function extFromFile(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 8 && fromName !== file.name) return fromName.toLowerCase();
  return "";
}

export async function uploadDriveFile(file: File): Promise<DriveUploadOk | DriveUploadErr> {
  if (file.size > MAX_DRIVE_FILE_MB * 1024 * 1024) {
    return { ok: false, error: `文件不能超过 ${MAX_DRIVE_FILE_MB}MB` };
  }

  try {
    const supabase = createClient();
    const ext = extFromFile(file);
    const random = Math.random().toString(36).slice(2, 10);
    const path = `${Date.now()}-${random}${ext ? "." + ext : ""}`;
    const { error } = await supabase.storage
      .from(DRIVE_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
    if (error) throw error;
    return { ok: true, storagePath: path, size: file.size };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "上传失败，请重试" };
  }
}

// 存回：Monaco / 表格编辑保存时覆盖原对象内容
export async function overwriteDriveFile(
  storagePath: string,
  content: Blob | string,
  contentType?: string,
): Promise<DriveUploadOk | DriveUploadErr> {
  try {
    const supabase = createClient();
    const body = typeof content === "string" ? new Blob([content], { type: contentType }) : content;
    const { error } = await supabase.storage
      .from(DRIVE_BUCKET)
      .upload(storagePath, body, { cacheControl: "3600", upsert: true, contentType });
    if (error) throw error;
    return { ok: true, storagePath, size: body.size };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "保存失败，请重试" };
  }
}

export function extFromName(name: string): string {
  const parts = name.split(".");
  if (parts.length < 2) return "";
  return parts.pop()!.toLowerCase();
}
