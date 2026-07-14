import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  WatchlistItem,
  WatchlistItemInput,
  TradingBrief,
  BriefPayload,
  TradingBriefScope,
} from "@/lib/types";

// ============================================================
// 关注清单
// ============================================================

export async function listWatchlist(): Promise<WatchlistItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("watchlist_items")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as WatchlistItem[];
}

/** 生成研报时只取启用的标的，按展示顺序排列。 */
export async function listEnabledWatchlist(): Promise<WatchlistItem[]> {
  const rows = await listWatchlist();
  return rows.filter((r) => r.enabled);
}

async function currentEmail(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

export async function createWatchlistItem(
  input: WatchlistItemInput,
): Promise<WatchlistItem> {
  const supabase = await createClient();
  const email = await currentEmail();
  const { id, ...rest } = input;
  const { data, error } = await supabase
    .from("watchlist_items")
    .insert({ ...rest, updated_by: email })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as WatchlistItem;
}

export async function updateWatchlistItem(
  id: string,
  input: WatchlistItemInput,
): Promise<WatchlistItem> {
  const supabase = await createClient();
  const email = await currentEmail();
  const { id: _ignored, ...rest } = input;
  const { data, error } = await supabase
    .from("watchlist_items")
    .update({ ...rest, updated_by: email })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as WatchlistItem;
}

export async function deleteWatchlistItem(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("watchlist_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ============================================================
// 研报
// ============================================================

export async function listBriefs(limit = 30): Promise<TradingBrief[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trading_briefs")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as TradingBrief[];
}

export async function getBrief(id: string): Promise<TradingBrief | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trading_briefs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as TradingBrief) ?? null;
}

export async function createBrief(input: {
  scope: TradingBriefScope;
  title: string;
  event_note?: string | null;
  payload: BriefPayload;
  summary?: string | null;
}): Promise<TradingBrief> {
  const supabase = await createClient();
  const email = await currentEmail();
  const { data, error } = await supabase
    .from("trading_briefs")
    .insert({
      scope: input.scope,
      title: input.title,
      event_note: input.event_note ?? null,
      payload: input.payload,
      summary: input.summary ?? null,
      created_by: email,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as TradingBrief;
}
