-- ============================================================================
-- 文档库（云盘）后端：邻接树 drive_nodes + 私有 drive 桶。
-- 在 Supabase 控制台 SQL Editor 里整份跑一次即可。可重复执行（幂等）。
--
-- 设计取舍：
--  · 文件夹和文件同表（kind 区分），parent_id 自引用成树，null = 根目录。
--  · 与 products 一致的「全店共用」模型：登录（authenticated）即可读写全部。
--  · 文件对象本体存 Storage 私有桶 drive，drive_nodes 只存元数据 + storage_path。
--    对外一律用服务端签名 URL 访问，不暴露公共直链。
-- ============================================================================

-- 扩展：gen_random_uuid()
create extension if not exists "pgcrypto";

-- ── 表 ──────────────────────────────────────────────────────────────────────
create table if not exists public.drive_nodes (
  id           uuid primary key default gen_random_uuid(),
  parent_id    uuid references public.drive_nodes (id) on delete cascade,
  kind         text not null check (kind in ('folder', 'file')),
  name         text not null,
  -- 以下字段仅文件用（文件夹留空）
  storage_path text,                       -- drive 桶内对象路径
  mime_type    text,
  ext          text,                        -- 小写扩展名，不含点，用于前端分发 viewer
  size         bigint,                      -- 字节
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   text                         -- 最后操作人邮箱（审计）
);

-- 同一目录下不允许重名（NULL parent_id 视作根，用部分索引单独约束）
create unique index if not exists drive_nodes_parent_name_key
  on public.drive_nodes (parent_id, name)
  where parent_id is not null;
create unique index if not exists drive_nodes_root_name_key
  on public.drive_nodes (name)
  where parent_id is null;

create index if not exists drive_nodes_parent_idx on public.drive_nodes (parent_id);

-- updated_at 自动维护
create or replace function public.touch_drive_nodes_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_drive_nodes_updated_at on public.drive_nodes;
create trigger trg_drive_nodes_updated_at
  before update on public.drive_nodes
  for each row execute function public.touch_drive_nodes_updated_at();

-- ── RLS：登录即可读写（对齐 products 全员共用）──────────────────────────────
alter table public.drive_nodes enable row level security;

drop policy if exists "drive_nodes read"   on public.drive_nodes;
drop policy if exists "drive_nodes insert" on public.drive_nodes;
drop policy if exists "drive_nodes update" on public.drive_nodes;
drop policy if exists "drive_nodes delete" on public.drive_nodes;

create policy "drive_nodes read"   on public.drive_nodes
  for select to authenticated using (true);
create policy "drive_nodes insert" on public.drive_nodes
  for insert to authenticated with check (true);
create policy "drive_nodes update" on public.drive_nodes
  for update to authenticated using (true) with check (true);
create policy "drive_nodes delete" on public.drive_nodes
  for delete to authenticated using (true);

-- ── 私有 Storage 桶 drive ────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('drive', 'drive', false)
on conflict (id) do nothing;

-- 桶策略：登录用户可读写 drive 桶（对象访问经服务端签名 URL 下发）
drop policy if exists "drive bucket read"   on storage.objects;
drop policy if exists "drive bucket insert" on storage.objects;
drop policy if exists "drive bucket update" on storage.objects;
drop policy if exists "drive bucket delete" on storage.objects;

create policy "drive bucket read" on storage.objects
  for select to authenticated using (bucket_id = 'drive');
create policy "drive bucket insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'drive');
create policy "drive bucket update" on storage.objects
  for update to authenticated using (bucket_id = 'drive') with check (bucket_id = 'drive');
create policy "drive bucket delete" on storage.objects
  for delete to authenticated using (bucket_id = 'drive');
