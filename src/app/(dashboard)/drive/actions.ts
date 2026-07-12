"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createFolder,
  createFileRecord,
  renameNode,
  deleteNode,
  touchFile,
  createSignedUrl,
  getNode,
} from "@/lib/drive";

// 所有写操作先鉴权：Server Function 可被直接 POST 命中，不能只靠 UI 隐藏入口
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登录");
  return user;
}

function str(formData: FormData, k: string): string {
  return String(formData.get(k) ?? "").trim();
}

export async function createFolderAction(_prev: unknown, formData: FormData) {
  await requireUser();
  const name = str(formData, "name");
  const parentId = str(formData, "parent_id") || null;
  if (!name) return { error: "文件夹名称不能为空" };
  try {
    await createFolder(name, parentId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "新建文件夹失败" };
  }
  revalidatePath("/drive");
  return { error: null };
}

// 客户端已把文件传到 drive 桶，这里只落库元数据
export async function registerFileAction(formData: FormData) {
  await requireUser();
  const name = str(formData, "name");
  const parentId = str(formData, "parent_id") || null;
  const storagePath = str(formData, "storage_path");
  const mimeType = str(formData, "mime_type") || null;
  const ext = str(formData, "ext") || null;
  const size = Number(formData.get("size") ?? 0);
  if (!name || !storagePath) return { error: "缺少文件信息" };
  try {
    await createFileRecord({ name, parent_id: parentId, storage_path: storagePath, mime_type: mimeType, ext, size });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "保存文件记录失败" };
  }
  revalidatePath("/drive");
  return { error: null };
}

export async function renameNodeAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!id || !name) return { error: "缺少必要参数" };
  try {
    await renameNode(id, name);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "重命名失败" };
  }
  revalidatePath("/drive");
  return { error: null };
}

export async function deleteNodeAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  if (!id) return;
  await deleteNode(id);
  revalidatePath("/drive");
}

// 编辑器「存回」：客户端已覆盖 Storage 对象内容，这里只刷新元数据
export async function saveFileContentAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  const size = Number(formData.get("size") ?? 0);
  if (!id) return { error: "缺少文件 ID" };
  try {
    await touchFile(id, size);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "保存失败" };
  }
  revalidatePath("/drive");
  return { error: null };
}

// 打开文件预览/编辑器：换一个短时签名 URL 给客户端取内容
export async function getFileSignedUrlAction(id: string): Promise<{ url: string } | { error: string }> {
  await requireUser();
  const node = await getNode(id);
  if (!node || node.kind !== "file" || !node.storage_path) return { error: "文件不存在" };
  try {
    const url = await createSignedUrl(node.storage_path);
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "生成访问链接失败" };
  }
}
