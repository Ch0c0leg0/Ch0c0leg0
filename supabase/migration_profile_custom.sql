-- =============================================
-- Profil façon Discord : bio, pronoms, statut, avatar,
-- décoration, cadre, bannière, accent, style pseudo,
-- nameplate, effet.
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- Projet : https://qpbrsvgbwerfhsxqwgfm.supabase.co
-- =============================================

alter table public.profiles
  add column if not exists bio text not null default '',
  add column if not exists pronouns text not null default '',
  add column if not exists status_text text not null default '',
  add column if not exists avatar_url text not null default '',
  add column if not exists avatar_decoration text not null default 'none',
  add column if not exists profile_frame text not null default 'none',
  add column if not exists banner text not null default 'sunset',
  add column if not exists accent_color text not null default 'coral',
  add column if not exists name_style text not null default 'default',
  add column if not exists nameplate text not null default 'none',
  add column if not exists profile_effect text not null default 'none';
