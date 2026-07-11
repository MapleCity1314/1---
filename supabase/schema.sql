-- ============================================================
-- 闲鱼一元小店 · 商品中台 数据库结构
-- 在 Supabase 控制台 → SQL Editor 里整段粘贴执行
-- ============================================================

-- 商品表
create table if not exists public.products (
  id            text primary key,               -- 商品编号（业务主键，如 A001）
  title         text not null,                  -- 商品标题
  category      text,                           -- 分类
  condition     text,                           -- 成色
  description   text,                           -- 商品信息
  cost          numeric,                        -- 成本价
  price         numeric,                        -- 闲鱼售价
  profit        numeric,                        -- 预估利润
  profit_rate   numeric,                        -- 利润率（0~1 小数）
  stock         integer default 0,              -- 库存数量
  status        text default '待上架',          -- 上架状态：待拍图/待上架/已上架/已售出/下架
  image_url     text,                           -- 图片链接
  xianyu_url    text,                           -- 闲鱼商品链接
  resource_url  text,                           -- ⭐ 虚拟资料链接（网盘/下载）
  resource_code text,                           -- ⭐ 提取码/密码
  notes         text,                           -- 备注
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  updated_by    text                            -- 最后修改人邮箱
);

-- 更新时自动刷新 updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_touch on public.products;
create trigger trg_products_touch
  before update on public.products
  for each row execute function public.touch_updated_at();

-- 常用查询索引
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_status on public.products (status);
create index if not exists idx_products_updated_at on public.products (updated_at desc);

-- ============================================================
-- 行级安全（RLS）：只有登录用户可读写，游客无任何权限
-- 你和朋友是两个独立账号，都属于「已认证用户」
-- ============================================================
alter table public.products enable row level security;

drop policy if exists "authenticated can read" on public.products;
create policy "authenticated can read"
  on public.products for select
  to authenticated using (true);

drop policy if exists "authenticated can insert" on public.products;
create policy "authenticated can insert"
  on public.products for insert
  to authenticated with check (true);

drop policy if exists "authenticated can update" on public.products;
create policy "authenticated can update"
  on public.products for update
  to authenticated using (true) with check (true);

drop policy if exists "authenticated can delete" on public.products;
create policy "authenticated can delete"
  on public.products for delete
  to authenticated using (true);

-- ============================================================
-- 商品图片存储桶：public 桶用于直接展示，写入仍受 RLS 限制
-- 登录用户可上传/替换/删除，任何人（包括未登录）可读取公开图片
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public can read product images" on storage.objects;
create policy "public can read product images"
  on storage.objects for select
  to public using (bucket_id = 'product-images');

drop policy if exists "authenticated can upload product images" on storage.objects;
create policy "authenticated can upload product images"
  on storage.objects for insert
  to authenticated with check (bucket_id = 'product-images');

drop policy if exists "authenticated can update product images" on storage.objects;
create policy "authenticated can update product images"
  on storage.objects for update
  to authenticated using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "authenticated can delete product images" on storage.objects;
create policy "authenticated can delete product images"
  on storage.objects for delete
  to authenticated using (bucket_id = 'product-images');
