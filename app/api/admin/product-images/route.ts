import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";

/** Galerie produit — admin uniquement (proxy garde déjà /api/upload, on revérifie ici). */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const productId = Number(searchParams.get("productId"));
  if (!Number.isFinite(productId)) return NextResponse.json({ images: [] });
  try {
    const { data } = await createAdminClient()
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("position", { ascending: true });
    return NextResponse.json({ images: Array.isArray(data) ? data : [] });
  } catch {
    return NextResponse.json({ images: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  let body: { productId?: number; url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const productId = Number(body.productId);
  const url = String(body.url ?? "").trim();
  if (!Number.isFinite(productId) || !url) {
    return NextResponse.json({ error: "Produit et URL requis." }, { status: 400 });
  }
  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("product_images")
      .select("position")
      .eq("product_id", productId)
      .order("position", { ascending: false })
      .limit(1);
    const nextPos =
      Array.isArray(existing) && existing.length > 0
        ? Number((existing[0] as unknown as { position: unknown }).position ?? 0) + 1
        : 0;
    const { data, error } = await admin
      .from("product_images")
      .insert({ product_id: productId, url, position: nextPos })
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ image: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Échec ajout image.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!Number.isFinite(id)) return NextResponse.json({ error: "ID invalide." }, { status: 400 });
  try {
    await createAdminClient().from("product_images").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Échec suppression.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
