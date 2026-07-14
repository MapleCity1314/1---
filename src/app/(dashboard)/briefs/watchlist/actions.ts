"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createWatchlistItem,
  updateWatchlistItem,
  deleteWatchlistItem,
} from "@/lib/briefs";
import { ASSET_TYPES, type AssetType, type WatchlistItemInput } from "@/lib/types";

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

function parseForm(formData: FormData): WatchlistItemInput {
  const assetTypeRaw = str(formData, "asset_type");
  const asset_type: AssetType = (ASSET_TYPES as readonly string[]).includes(assetTypeRaw)
    ? (assetTypeRaw as AssetType)
    : "crypto";
  return {
    symbol: str(formData, "symbol"),
    display_name: str(formData, "display_name"),
    asset_type,
    binance_symbol: str(formData, "binance_symbol") || null,
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    enabled: formData.get("enabled") === "on",
    notes: str(formData, "notes") || null,
  };
}

export async function createWatchlistItemAction(_prev: unknown, formData: FormData) {
  await requireUser();
  const input = parseForm(formData);
  if (!input.symbol) return { error: "标的代码不能为空" };
  if (!input.display_name) return { error: "展示名不能为空" };
  try {
    await createWatchlistItem(input);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "未知错误";
    return { error: msg.includes("duplicate") ? "该标的代码已存在" : "新增失败：" + msg };
  }
  revalidatePath("/briefs/watchlist");
  return { error: null };
}

export async function updateWatchlistItemAction(_prev: unknown, formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  if (!id) return { error: "缺少标的 ID" };
  const input = parseForm(formData);
  if (!input.symbol) return { error: "标的代码不能为空" };
  if (!input.display_name) return { error: "展示名不能为空" };
  try {
    await updateWatchlistItem(id, input);
  } catch (e) {
    return { error: "更新失败：" + (e instanceof Error ? e.message : "未知错误") };
  }
  revalidatePath("/briefs/watchlist");
  return { error: null };
}

export async function deleteWatchlistItemAction(formData: FormData) {
  await requireUser();
  const id = str(formData, "id");
  if (!id) return;
  await deleteWatchlistItem(id);
  revalidatePath("/briefs/watchlist");
}
