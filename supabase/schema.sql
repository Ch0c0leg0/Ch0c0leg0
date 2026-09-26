-- =============================================
-- Boutique gaming — schéma Supabase (Postgres)
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- Projet : https://qpbrsvgbwerfhsxqwgfm.supabase.co
-- =============================================

-- ---------- Tables ----------

create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  icon text not null default 'Gamepad2',
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists public.products (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  price integer not null,              -- centimes EUR
  compare_at_price integer,            -- centimes EUR, nullable (prix barré)
  stock integer not null default 0,
  image_url text not null default '',
  active boolean not null default true,
  featured boolean not null default false,
  category_id bigint references public.categories(id) on delete set null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email text not null default '',
  address_line1 text not null default '',
  address_city text not null default '',
  address_postal_code text not null default '',
  address_country text not null default 'FR',
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists public.promo_codes (
  id bigint generated always as identity primary key,
  code text not null unique,
  type text not null default 'percent', -- percent | amount
  value integer not null,               -- % (ex 10) ou centimes (ex 500)
  min_amount integer not null default 0,-- panier mini en centimes
  active boolean not null default true,
  expires_at bigint,                    -- ms epoch, nullable
  usage_limit integer,                  -- nullable = illimité
  used_count integer not null default 0,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  status text not null default 'pending', -- pending | paid | shipped | cancelled | refunded
  customer_email text not null,
  customer_name text not null,
  address_line1 text not null,
  address_city text not null,
  address_postal_code text not null,
  address_country text not null default 'FR',
  amount_total integer not null,        -- centimes EUR (après remise)
  promo_code text,
  discount_amount integer not null default 0,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  product_name text not null,
  unit_price integer not null,          -- centimes EUR
  quantity integer not null default 1
);

-- ---------- Index ----------

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(active);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ---------- RLS ----------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.promo_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Lecture publique : catégories + produits actifs
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories
  for select using (true);

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products
  for select using (active = true);

-- Codes promo valides visibles par tous (le serveur valide le reste)
drop policy if exists "promo public read" on public.promo_codes;
create policy "promo public read" on public.promo_codes
  for select using (active = true);

-- Profils : le propriétaire uniquement
drop policy if exists "profiles owner read" on public.profiles;
create policy "profiles owner read" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles owner write" on public.profiles;
create policy "profiles owner write" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Commandes : lecture par le propriétaire (les guests passent par le serveur)
drop policy if exists "orders owner read" on public.orders;
create policy "orders owner read" on public.orders
  for select using (auth.uid() = user_id);
drop policy if exists "order items owner read" on public.order_items;
create policy "order items owner read" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- NOTE : toutes les écritures métier (commandes, stock, promos, admin)
-- passent par le serveur Next.js avec SUPABASE_SERVICE_ROLE_KEY
-- (bypass RLS), jamais depuis le navigateur.
