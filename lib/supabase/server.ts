import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./config";
import type { Database } from "./database";

/**
 * Client Supabase côté serveur (Server Components, Route Handlers,
 * Server Actions). Lit/écrit les cookies de session via next/headers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Appelé depuis un Server Component (lecture seule) : ignoré,
          // la session sera rafraîchie par le proxy (middleware).
        }
      },
    },
  });
}
