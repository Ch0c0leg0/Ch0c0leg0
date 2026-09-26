import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapPromoCode } from "@/lib/supabase/mappers";
import type { PromoCodeRow } from "@/lib/supabase/types";

/** Meilleur code à seuil (pour la barre de progression du panier). */
export async function GET() {
  const { data } = await createAdminClient()
    .from("promo_codes")
    .select("*")
    .eq("active", true);
  if (!Array.isArray(data)) return NextResponse.json({ promo: null });
  const now = Date.now();
  const valid = (data as unknown as PromoCodeRow[])
    .map(mapPromoCode)
    .filter(
      (p) =>
        p.minAmount > 0 &&
        (!p.expiresAt || p.expiresAt > now) &&
        (p.usageLimit === null || p.usedCount < p.usageLimit)
    )
    .sort((a, b) => b.minAmount - a.minAmount);
  const best = valid[0] ?? null;
  if (!best) return NextResponse.json({ promo: null });
  return NextResponse.json({
    promo: {
      code: best.code,
      type: best.type,
      value: best.value,
      minAmount: best.minAmount,
    },
  });
}
