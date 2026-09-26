-- =============================================
-- Boutique gaming — migration tous lots (discret)
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- Idempotent : peut être rejoué sans risque
-- =============================================

-- ---------- Commandes : livraison réelle + facture ----------
alter table public.orders add column if not exists carrier text not null default 'domicile';
alter table public.orders add column if not exists tracking_number text not null default '';
alter table public.orders add column if not exists shipping_price integer not null default 0;
alter table public.orders add column if not exists invoice_number text unique;

-- ---------- Galerie produit ----------
create table if not exists public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);
create index if not exists product_images_product_idx on public.product_images(product_id);

-- ---------- Packs (bundles) ----------
alter table public.products add column if not exists bundle_ids bigint[] not null default '{}';

-- ---------- Avis enrichis ----------
alter table public.reviews add column if not exists helpful_count integer not null default 0;
alter table public.reviews add column if not exists merchant_reply text not null default '';

create table if not exists public.review_votes (
  review_id bigint not null references public.reviews(id) on delete cascade,
  user_id uuid,
  guest_key text not null default '',
  value integer not null default 1,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  primary key (review_id, guest_key)
);
create index if not exists review_votes_review_idx on public.review_votes(review_id);

-- ---------- Parrainage ----------
alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists referred_by text;

-- ---------- Relances panier ----------
create table if not exists public.cart_reminders (
  id bigint generated always as identity primary key,
  email text not null,
  cart_json jsonb not null default '[]'::jsonb,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  sent_at bigint
);
create index if not exists cart_reminders_email_idx on public.cart_reminders(email);

-- ---------- Tarifs livraison ----------
create table if not exists public.shipping_rates (
  id bigint generated always as identity primary key,
  zone text not null default 'FR',
  label text not null,
  price integer not null default 0,
  min_amount integer not null default 0,
  active boolean not null default true
);
insert into public.shipping_rates (zone, label, price, min_amount, active)
values
  ('FR', 'Domicile offerte', 0, 0, true),
  ('FR', 'Point relais', 490, 0, true)
on conflict do nothing;

-- ---------- Articles guides (blog SEO discret) ----------
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  published boolean not null default true,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);
insert into public.posts (slug, title, excerpt, body, published) values
  ('bien-choisir-son-clavier', 'Bien choisir son clavier gaming', 'Membrane, mécanique, TKL : l’essentiel sans jargon.', 'Contenu à compléter : switches, format, budget. Ce guide reste volontairement court.', true),
  ('souris-legere-ou-lourde', 'Souris légère ou lourde ?', 'DPI, capteur, prise en main : ce qui change vraiment.', 'Contenu à compléter : capteurs, poids, formes. Guide court et discret.', true),
  ('entretenir-son-setup', 'Entretenir son setup', 'Nettoyage, câbles, ergonomie : 10 minutes par mois.', 'Contenu à compléter : tapis, switches, écrans. Guide court et discret.', true)
on conflict (slug) do nothing;

-- ---------- RLS ----------
alter table public.product_images enable row level security;
alter table public.review_votes enable row level security;
alter table public.cart_reminders enable row level security;
alter table public.shipping_rates enable row level security;
alter table public.posts enable row level security;

drop policy if exists "product images public read" on public.product_images;
create policy "product images public read" on public.product_images for select using (true);

drop policy if exists "shipping public read" on public.shipping_rates;
create policy "shipping public read" on public.shipping_rates for select using (active = true);

drop policy if exists "posts public read" on public.posts;
create policy "posts public read" on public.posts for select using (published = true);

drop policy if exists "reviews votes public read" on public.review_votes;
create policy "reviews votes public read" on public.review_votes for select using (true);

-- NOTE : écritures métier via SUPABASE_SERVICE_ROLE_KEY (serveur Next.js), jamais navigateur.

-- ---------- Présence comptes (section admin Utilisateurs) ----------
alter table public.profiles add column if not exists last_seen_at bigint;
