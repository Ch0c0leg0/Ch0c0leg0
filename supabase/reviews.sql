-- =============================================
-- Avis clients — Ch0c0leg0
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- (après supabase/schema.sql)
-- =============================================

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default '',
  rating integer not null check (rating >= 1 and rating <= 5),
  title text not null default '',
  body text not null default '',
  status text not null default 'pending', -- pending | approved | rejected
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  unique (product_id, user_id)
);

create index if not exists reviews_product_idx on public.reviews(product_id);
create index if not exists reviews_status_idx on public.reviews(status);
create index if not exists reviews_user_idx on public.reviews(user_id);

alter table public.reviews enable row level security;

-- Lecture publique : uniquement les avis approuvés.
drop policy if exists "reviews public read" on public.reviews;
create policy "reviews public read" on public.reviews
  for select using (status = 'approved');

-- Un compte connecté peut déposer UN avis par produit (à son nom).
drop policy if exists "reviews owner insert" on public.reviews;
create policy "reviews owner insert" on public.reviews
  for insert with check (auth.uid() = user_id);

-- ... et modifier / retirer le sien tant qu'il est en attente.
drop policy if exists "reviews owner update" on public.reviews;
create policy "reviews owner update" on public.reviews
  for update using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id);

drop policy if exists "reviews owner delete" on public.reviews;
create policy "reviews owner delete" on public.reviews
  for delete using (auth.uid() = user_id);

-- NOTE : la modération (approuver / refuser) passe par le serveur
-- Next.js avec SUPABASE_SERVICE_ROLE_KEY (bypass RLS).
