import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DriveNode, DriveNodeInput } from "@/lib/types";

const BUCKET = "drive";
const SIGNED_URL_TTL = 60 * 5; // 5 分钟，够用一次预览/下载

// 当前登录用户邮箱（写入 updated_by 审计字段）
async function currentEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

// 列出某目录下的直接子节点（文件夹在前，同类按名称排序）
export async function listNodes(parentId: string | null): Promise<DriveNode[]> {
  const supabase = await createClient();
  let query = supabase.from("drive_nodes").select("*");
  query = parentId ? query.eq("parent_id", parentId) : query.is("parent_id", null);
  const { data, error } = await query.order("kind", { ascending: false }).order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as DriveNode[];
}

export async function getNode(id: string): Promise<DriveNode | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drive_nodes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as DriveNode) ?? null;
}

// 面包屑：从根到当前目录的路径链
export async function getBreadcrumb(id: string | null): Promise<DriveNode[]> {
  const chain: DriveNode[] = [];
  let cursor = id;
  while (cursor) {
    const node = await getNode(cursor);
    if (!node) break;
    chain.unshift(node);
    cursor = node.parent_id;
  }
  return chain;
}

export async function createFolder(name: string, parentId: string | null): Promise<DriveNode> {
  const supabase = await createClient();
  const email = await currentEmail();
  const { data, error } = await supabase
    .from("drive_nodes")
    .insert({ name, parent_id: parentId, kind: "folder", updated_by: email })
    .select("*")
    .single();
  if (error) throw new Error(error.message.includes("duplicate") ? "同目录下已存在同名文件/文件夹" : error.message);
  return data as DriveNode;
}

// 注册一个已上传到 Storage 的文件（客户端先传桶，再调用这个落库）
export async function createFileRecord(input: DriveNodeInput): Promise<DriveNode> {
  const supabase = await createClient();
  const email = await currentEmail();
  const { data, error } = await supabase
    .from("drive_nodes")
    .insert({ ...input, kind: "file", updated_by: email })
    .select("*")
    .single();
  if (error) {
    // 落库失败时清理已上传的孤儿对象
    if (input.storage_path) await supabase.storage.from(BUCKET).remove([input.storage_path]);
    throw new Error(error.message.includes("duplicate") ? "同目录下已存在同名文件/文件夹" : error.message);
  }
  return data as DriveNode;
}

export async function renameNode(id: string, name: string): Promise<DriveNode> {
  const supabase = await createClient();
  const email = await currentEmail();
  const { data, error } = await supabase
    .from("drive_nodes")
    .update({ name, updated_by: email })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message.includes("duplicate") ? "同目录下已存在同名文件/文件夹" : error.message);
  return data as DriveNode;
}

// 文件内容存回（Monaco / 表格编辑保存）：覆盖 Storage 对象 + 刷新 size/updated_at
export async function touchFile(id: string, size: number): Promise<DriveNode> {
  const supabase = await createClient();
  const email = await currentEmail();
  const { data, error } = await supabase
    .from("drive_nodes")
    .update({ size, updated_by: email })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as DriveNode;
}

// 递归收集某节点及其所有后代（用于删除文件夹时级联清理 Storage 对象）
async function collectDescendants(id: string): Promise<DriveNode[]> {
  const supabase = await createClient();
  const all: DriveNode[] = [];
  let frontier = [id];
  while (frontier.length > 0) {
    const { data, error } = await supabase
      .from("drive_nodes")
      .select("*")
      .in("parent_id", frontier);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as DriveNode[];
    all.push(...rows);
    frontier = rows.map((r) => r.id);
  }
  return all;
}

export async function deleteNode(id: string): Promise<void> {
  const supabase = await createClient();
  const node = await getNode(id);
  if (!node) return;

  const descendants = node.kind === "folder" ? await collectDescendants(id) : [];
  const paths = [node, ...descendants]
    .filter((n) => n.kind === "file" && n.storage_path)
    .map((n) => n.storage_path as string);

  if (paths.length > 0) {
    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) throw new Error(error.message);
  }

  // drive_nodes 上的外键是 on delete cascade，删根节点即可级联删子记录
  const { error } = await supabase.from("drive_nodes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// 生成短时签名 URL，用于预览/下载/在线编辑器取内容
export async function createSignedUrl(storagePath: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

