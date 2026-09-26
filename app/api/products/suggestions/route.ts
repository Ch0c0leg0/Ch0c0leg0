import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProduct } from "@/lib/supabase/mappers";
import type { ProductRow } from "@/lib/supabase/types";

/** Suggestions : autocomplete (q) ou compléments panier (exclude). Discret, 6 max. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const exclude = new Set(
    (searchParams.get("exclude") ?? "")
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n))
  );
  const admin = createAdminClient();
  let query = admin.from("products").select("*").eq("active", true).gt("stock", 0);
  if (q) {
    const term = `%${q}%`;
    query = query.or(`name.ilike.${term},description.ilike.${term}`);
  } else {
    query = query.order("price", { ascending: true });
  }
  const { data } = await query.limit(q ? 6 : 20);
  if (!Array.isArray(data)) return NextResponse.json({ products: [] });
  const all = (data as unknown as ProductRow[]).map(mapProduct);
  const picked = all.filter((p) => !exclude.has(p.id)).slice(0, q ? 6 : 3);
  return NextResponse.json({ products: picked });
}
