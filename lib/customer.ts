import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PRESENCE_TTL_MS = 5 * 60 * 1000;
export const ONLINE_WINDOW_MS = 10 * 60 * 1000;

/** Marque le compte comme actif (throttle 5 min, silencieux si colonne absente). */
export async function touchPresence(userId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("last_seen_at")
      .eq("id", userId)
      .maybeSingle();
    const last = Number(
      (data as unknown as { last_seen_at?: unknown } | null)?.last_seen_at ?? 0
    );
    if (Date.now() - last < PRESENCE_TTL_MS) return;
    await admin
      .from("profiles")
      .update({ last_seen_at: Date.now() })
      .eq("id", userId);
  } catch {
    // Migration non jouée ou profil absent : présence simplement indisponible.
  }
}

/** Garantit l'existence du profil après connexion / inscription. */
export async function ensureProfile(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!existing) {
    // Pseudo initial : display_name saisi, sinon nom Google, sinon préfixe e-mail.
    const googleName = String(
      user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""
    ).trim();
    await admin.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      display_name:
        String(user.user_metadata?.display_name ?? "").trim() ||
        googleName ||
        (user.email ?? "").split("@")[0],
    });
  }
  void touchPresence(user.id).catch(() => {});
  return user.id;
}

/** Utilisateur connecté ou null (ne redirige jamais). */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

export async function requireCustomer() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/connexion");
  void touchPresence(data.user.id).catch(() => {});
  return data.user;
}
