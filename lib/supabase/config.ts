export function supabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Variable d'environnement manquante : NEXT_PUBLIC_SUPABASE_URL");
  return url;
}

export function supabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Variable d'environnement manquante : NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return key;
}

export function supabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Variable d'environnement manquante : SUPABASE_SERVICE_ROLE_KEY");
  return key;
}

/** True si les clés Supabase (publiques) sont renseignées et non placeholder. */
export function hasSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return false;
  if (url.includes("xxx") || key.includes("xxx")) return false;
  return url.startsWith("https://");
}
