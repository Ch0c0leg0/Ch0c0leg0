import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";

/** Cron discret : relance panier abandonné 1x/j (Authorization: Bearer CRON_SECRET). */
export async function POST(request: NextRequest) {
  const secret = (process.env.CRON_SECRET ?? "").trim();
  if (secret) {
    const auth = request.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
  }
  let reminders: { id: number; email: string; cart_json: unknown }[] = [];
  try {
    const { data } = await createAdminClient()
      .from("cart_reminders")
      .select("id,email,cart_json")
      .is("sent_at", null)
      .gte("created_at", Date.now() - 7 * 24 * 3600 * 1000)
      .limit(50);
    if (Array.isArray(data)) {
      reminders = data as unknown as typeof reminders;
    }
  } catch {
    return NextResponse.json({ sent: 0, skipped: true });
  }
  if (reminders.length === 0) return NextResponse.json({ sent: 0 });
  const { sendAbandonedCart } = await import("@/lib/email");
  let sent = 0;
  for (const r of reminders) {
    const cart = Array.isArray(r.cart_json) ? r.cart_json : [];
    const total = (cart as { price?: unknown; quantity?: unknown }[]).reduce(
      (s, i) => s + Number(i.price ?? 0) * Number(i.quantity ?? 0),
      0
    );
    try {
      await sendAbandonedCart({
        to: r.email,
        totalLabel: formatPrice(total),
        count: cart.length,
      });
      await createAdminClient().from("cart_reminders").update({ sent_at: Date.now() }).eq("id", r.id);
      sent += 1;
    } catch {
      // On réessaiera au prochain passage.
    }
  }
  return NextResponse.json({ sent });
}

export async function GET(request: NextRequest) {
  return POST(request);
}
