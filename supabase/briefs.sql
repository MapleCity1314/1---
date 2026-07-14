-- ============================================================================
-- 盘面研报模块后端：关注清单 watchlist_items + 研报 trading_briefs。
-- 在 Supabase 控制台 SQL Editor 里整份跑一次即可。可重复执行（幂等）。
--
-- 设计取舍：
--  · 与 products/drive_nodes 一致的「全店共用」模型：登录（authenticated）即可读写全部。
--  · trading_briefs.payload 存结构化研报（JSON），渲染时按字段拼版式，不存 markdown 大文本，
--    方便前端精确渲染成白卡而不是把 AI 输出当成纯文本贴出来。
--  · 位点数字来源混合：crypto 类由服务端从 Binance K 线确定性计算；黄金/存储股/宏观类由 AI
--    基于 Tavily 联网结果估算，payload 里每个标的都带 data_source 字段区分，前端据此提示。
-- ============================================================================

-- ── 关注清单 ────────────────────────────────────────────────────────────────
create table if not exists public.watchlist_items (
  id             uuid primary key default gen_random_uuid(),
  symbol         text not null,                 -- 展示用代码，如 BTCUSDT / XAUUSD / SKHYNIXUSDT
  display_name   text not null,                 -- 展示名，如「BTC」「黄金」「SK海力士」
  asset_type     text not null check (asset_type in ('crypto', 'commodity', 'stock', 'macro')),
  binance_symbol text,                          -- 可在 Binance 拉到 K 线时填（如 BTCUSDT）；拉不到留空走 Tavily
  sort_order     integer not null default 0,    -- 研报里标的的展示顺序
  enabled        boolean not null default true, -- 关闭后生成研报时跳过，不删历史数据
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  updated_by     text
);

create unique index if not exists watchlist_items_symbol_key on public.watchlist_items (symbol);
create index if not exists watchlist_items_sort_idx on public.watchlist_items (sort_order);

create or replace function public.touch_watchlist_items_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_watchlist_items_updated_at on public.watchlist_items;
create trigger trg_watchlist_items_updated_at
  before update on public.watchlist_items
  for each row execute function public.touch_watchlist_items_updated_at();

alter table public.watchlist_items enable row level security;

drop policy if exists "watchlist_items read"   on public.watchlist_items;
drop policy if exists "watchlist_items insert" on public.watchlist_items;
drop policy if exists "watchlist_items update" on public.watchlist_items;
drop policy if exists "watchlist_items delete" on public.watchlist_items;

create policy "watchlist_items read"   on public.watchlist_items
  for select to authenticated using (true);
create policy "watchlist_items insert" on public.watchlist_items
  for insert to authenticated with check (true);
create policy "watchlist_items update" on public.watchlist_items
  for update to authenticated using (true) with check (true);
create policy "watchlist_items delete" on public.watchlist_items
  for delete to authenticated using (true);

-- ── 研报 ────────────────────────────────────────────────────────────────────
create table if not exists public.trading_briefs (
  id           uuid primary key default gen_random_uuid(),
  scope        text not null check (scope in ('daily', 'manual', 'event')),
  title        text not null,
  event_note   text,                            -- 手动生成时可附的「关键节点」说明，如"美联储议息"
  payload      jsonb not null,                  -- 结构化研报正文（各标的位点/思路 + 今日结论 + 时间表 + 风险提醒）
  summary      text,                            -- 一句话摘要，用于列表页
  generated_at timestamptz not null default now(),
  created_by   text
);

create index if not exists trading_briefs_generated_at_idx on public.trading_briefs (generated_at desc);
create index if not exists trading_briefs_scope_idx on public.trading_briefs (scope);

alter table public.trading_briefs enable row level security;

drop policy if exists "trading_briefs read"   on public.trading_briefs;
drop policy if exists "trading_briefs insert" on public.trading_briefs;
drop policy if exists "trading_briefs delete" on public.trading_briefs;

create policy "trading_briefs read"   on public.trading_briefs
  for select to authenticated using (true);
create policy "trading_briefs insert" on public.trading_briefs
  for insert to authenticated with check (true);
create policy "trading_briefs delete" on public.trading_briefs
  for delete to authenticated using (true);

-- ── 示例关注清单（可删改）────────────────────────────────────────────────────
insert into public.watchlist_items (symbol, display_name, asset_type, binance_symbol, sort_order)
values
  ('BTCUSDT', 'BTC', 'crypto', 'BTCUSDT', 10),
  ('XAUUSD', '黄金', 'commodity', null, 20),
  ('SKHYNIXUSDT', 'SK海力士', 'stock', null, 30),
  ('MUUSDT', '美光', 'stock', null, 40),
  ('SNDKUSDT', '闪迪', 'stock', null, 50)
on conflict (symbol) do nothing;
