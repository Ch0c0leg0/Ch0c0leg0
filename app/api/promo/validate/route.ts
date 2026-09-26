import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapPromoCode } from "@/lib/supabase/mappers";
import type { PromoCodeRow } from "@/lib/supabase/types";
import { formatPrice } from "@/lib/format";

/** Valide un code promo sans créer de commande (aperçu de la remise). */
export async function POST(request: NextRequest) {
  let body: { code?: string; subtotal?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const code = String(body.code ?? "").trim().toUpperCase();
  const subtotal = Math.floor(Number(body.subtotal ?? 0));
  if (!code) return NextResponse.json({ error: "Code manquant." }, { status: 400 });
  if (!subtotal || subtotal < 1) {
    return NextResponse.json({ error: "Panier vide." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("promo_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json({ error: "Code promo invalide." }, { status: 404 });
  }

  const promo = mapPromoCode(data as unknown as PromoCodeRow);
  if (!promo.active) {
    return NextResponse.json({ error: "Code promo désactivé." }, { status: 400 });
  }
  if (promo.expiresAt && Date.now() > promo.expiresAt) {
    return NextResponse.json({ error: "Code promo expiré." }, { status: 400 });
  }
  if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
    return NextResponse.json({ error: "Code promo épuisé." }, { status: 400 });
  }
  if (subtotal < promo.minAmount) {
    return NextResponse.json(
      {
        error: `Code valable à partir de ${formatPrice(promo.minAmount)} d'achat.`,
      },
      { status: 400 }
    );
  }

  const discount =
    promo.type === "percent"
      ? Math.round((subtotal * promo.value) / 100)
      : Math.min(promo.value, subtotal);

  return NextResponse.json({
    code: promo.code,
    type: promo.type,
    value: promo.value,
    discount,
    label:
      promo.type === "percent"
        ? `-${promo.value} % (${formatPrice(discount)})`
        : `-${formatPrice(discount)}`,
  });
}
