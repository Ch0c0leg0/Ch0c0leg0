import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProduct } from "@/lib/supabase/mappers";
import type { ProductRow } from "@/lib/supabase/types";

async function userId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Favoris du compte + (optionnel) hydratation par ids pour les invités. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");
  const admin = createAdminClient();

  const uid = await userId();
  if (!uid && !idsParam) {
    // Invité sans liste : le client utilise son localStorage.
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }
  let ids: number[] = [];
  if (uid) {
    const { data } = await admin
      .from("wishlist")
      .select("product_id")
      .eq("user_id", uid);
    if (Array.isArray(data)) {
      ids = (data as unknown as { product_id: number }[]).map((r) =>
        Number(r.product_id)
      );
    }
  } else if (idsParam) {
    ids = idsParam
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0)
      .slice(0, 100);
  }

  if (ids.length === 0) return NextResponse.json({ ids: [], products: [] });

  const { data: rows } = await admin
    .from("products")
    .select("*")
    .in("id", ids)
    .eq("active", true);
  const products = Array.isArray(rows)
    ? (rows as unknown as ProductRow[]).map(mapProduct)
    : [];
  // Conserve l'ordre des favoris.
  const order = new Map(ids.map((id, i) => [id, i]));
  products.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  // Notes moyennes (pour un rendu 100 % client, sans Server Component async).
  const { getRatingSummaries } = await import("@/lib/reviews");
  const summaries = await getRatingSummaries(products.map((p) => p.id)).catch(
    () => new Map()
  );
  const ratings: Record<number, { average: number; count: number }> = {};
  for (const [id, s] of summaries) ratings[id] = s;
  return NextResponse.json({ ids, products, ratings });
}

export async function POST(request: NextRequest) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const productId = Number(body.productId);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Produit invalide." }, { status: 400 });
  }
  const { error } = await createAdminClient().from("wishlist").upsert(
    { user_id: uid, product_id: productId },
    { onConflict: "user_id,product_id" }
  );
  if (error) {
    return NextResponse.json({ error: "Ajout impossible." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const uid = await userId();
  if (!uid) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const productId = Number(body.productId);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Produit invalide." }, { status: 400 });
  }
  await createAdminClient()
    .from("wishlist")
    .delete()
    .eq("user_id", uid)
    .eq("product_id", productId);
  return NextResponse.json({ ok: true });
}
