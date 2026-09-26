-- =============================================
-- Recadrage avatar : zoom + position (texte "zoom,tx,ty").
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- =============================================

alter table public.profiles
  add column if not exists avatar_crop text not null default '';
