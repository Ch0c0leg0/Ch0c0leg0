-- =============================================
-- Engagement : favoris, newsletter, contact — Ch0c0leg0
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- =============================================

-- ---------- Favoris ----------
create table if not exists public.wishlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  primary key (user_id, product_id)
);
create index if not exists wishlist_user_idx on public.wishlist(user_id);
alter table public.wishlist enable row level security;
drop policy if exists "wishlist owner all" on public.wishlist;
create policy "wishlist owner all" on public.wishlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Newsletter ----------
create table if not exists public.newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null unique,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);
alter table public.newsletter_subscribers enable row level security;
-- Aucune lecture publique : inscriptions via le serveur uniquement.
-- (pas de policy select => RLS bloque tout par défaut)

-- ---------- Messages de contact ----------
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null default '',
  email text not null default '',
  subject text not null default '',
  body text not null default '',
  read boolean not null default false,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);
alter table public.contact_messages enable row level security;
-- Lecture/écriture via le serveur uniquement (service_role).
