import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Message de contact (honeypot anti-bot inclus). */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (String(body.website ?? "").trim()) {
    return NextResponse.json({ ok: true });
  }
  const name = String(body.name ?? "").trim().slice(0, 80);
  const email = String(body.email ?? "").trim().toLowerCase();
  const subject = String(body.subject ?? "").trim().slice(0, 120);
  const message = String(body.message ?? "").trim().slice(0, 5000);
  if (!name || !subject || message.length < 10) {
    return NextResponse.json(
      { error: "Nom, sujet et message (10 caractères min) requis." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "E-mail invalide." }, { status: 400 });
  }
  const { error } = await createAdminClient().from("contact_messages").insert({
    name,
    email,
    subject,
    body: message,
  });
  if (error) {
    return NextResponse.json({ error: "Envoi impossible." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
