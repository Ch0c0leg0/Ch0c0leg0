import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/customer";

function makeCode(): string {
  return `C0-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/** Parrainage discret : code perso, récompense via WELCOME10 existant. */
export async function GET() {
  try {
    const user = await requireCustomer();
    const admin = createAdminClient();
    const { data } = await admin.from("profiles").select("referral_code").eq("id", user.id).maybeSingle();
    let code = String((data as unknown as { referral_code?: unknown } | null)?.referral_code ?? "");
    if (!code) {
      code = makeCode();
      try {
        await admin.from("profiles").update({ referral_code: code }).eq("id", user.id);
      } catch {
        // Colonne absente : on renvoie un code éphémère.
      }
    }
    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ error: "Connecte-toi." }, { status: 401 });
  }
}
