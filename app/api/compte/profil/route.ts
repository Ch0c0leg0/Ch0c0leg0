import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProfile } from "@/lib/supabase/mappers";
import type { ProfileRow } from "@/lib/supabase/types";

/** Profil du client connecté (pré-remplissage du checkout). */
export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ profile: null });

  const { data: row } = await createAdminClient()
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!row) {
    return NextResponse.json({
      profile: { email: data.user.email ?? "" },
    });
  }
  const { touchPresence } = await import("@/lib/customer");
  void touchPresence(data.user.id).catch(() => {});
  return NextResponse.json({ profile: mapProfile(row as unknown as ProfileRow) });
}
