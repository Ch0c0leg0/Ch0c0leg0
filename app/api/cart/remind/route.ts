import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Mémorise un panier abandonné (opt-in discret au checkout). */
export async function POST(request: NextRequest) {
  let body: { email?: string; cart?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) return NextResponse.json({ error: "E-mail invalide." }, { status: 400 });
  const cart = Array.isArray(body.cart) ? body.cart.slice(0, 20) : [];
  if (cart.length === 0) return NextResponse.json({ ok: true });
  try {
    await createAdminClient().from("cart_reminders").insert({
      email,
      cart_json: cart,
      created_at: Date.now(),
      sent_at: null,
    });
  } catch {
    // Table absente (migration non jouée) : on ignore silencieusement.
  }
  return NextResponse.json({ ok: true });
}
