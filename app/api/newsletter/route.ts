import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Inscription newsletter (honeypot anti-bot inclus). */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (String(body.website ?? "").trim()) {
    // Bot piégé : succès silencieux.
    return NextResponse.json({ ok: true });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "E-mail invalide." }, { status: 400 });
  }
  const { error } = await createAdminClient()
    .from("newsletter_subscribers")
    .upsert({ email }, { onConflict: "email" });
  if (error) {
    return NextResponse.json({ error: "Inscription impossible." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
