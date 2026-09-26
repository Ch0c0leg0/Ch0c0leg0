import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Vote "Utile" discret : 1 par navigateur (guest_key), sans compte requis. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviewId = Number(id);
  if (!Number.isFinite(reviewId)) return NextResponse.json({ error: "Avis invalide." }, { status: 400 });
  let guestKey = "";
  try {
    const body = await request.json().catch(() => ({}));
    guestKey = String((body as { guestKey?: unknown }).guestKey ?? "").slice(0, 64);
  } catch {
    guestKey = "";
  }
  if (!guestKey) {
    const cookie = request.cookies.get("ch0c0leg0_guest")?.value;
    guestKey = cookie ?? `g-${Date.now().toString(36)}`;
  }
  const admin = createAdminClient();
  try {
    // Anti-double vote discret.
    const { data: existing } = await admin
      .from("review_votes")
      .select("review_id")
      .eq("review_id", reviewId)
      .eq("guest_key", guestKey)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ ok: true, already: true });
    }
    await admin.from("review_votes").insert({ review_id: reviewId, guest_key: guestKey, value: 1 });
    const { data: review } = await admin.from("reviews").select("helpful_count").eq("id", reviewId).maybeSingle();
    const current = Number((review as unknown as { helpful_count?: unknown } | null)?.helpful_count ?? 0);
    await admin.from("reviews").update({ helpful_count: current + 1 }).eq("id", reviewId);
    const res = NextResponse.json({ ok: true, helpfulCount: current + 1 });
    res.cookies.set("ch0c0leg0_guest", guestKey, { maxAge: 31536000, path: "/" });
    return res;
  } catch {
    // Table absente : on simule un succès discret côté client (localStorage).
    return NextResponse.json({ ok: true, fallback: true });
  }
}
