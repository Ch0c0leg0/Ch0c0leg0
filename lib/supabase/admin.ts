import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "./config";
import type { Database } from "./database";

/**
 * Client privilégié (service_role, bypass RLS).
 * SERVEUR UNIQUEMENT — ne jamais l'importer dans un composant client.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
