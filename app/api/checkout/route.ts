import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import { mapProduct, mapPromoCode } from "@/lib/supabase/mappers";
import type { ProductRow, PromoCodeRow } from "@/lib/supabase/types";
import { getStripe } from "@/lib/stripe";
import { requireEnv } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

type CheckoutBody = {
  items: { productId: number; quantity: number }[];
  customerEmail: string;
  customerName: string;
  addressLine1: string;
  addressCity: string;
  addressPostalCode: string;
  addressCountry?: string;
  promoCode?: string;
  carrier?: string;
};

type ValidatedPromo = {
  code: string;
  type: "percent" | "amount";
  discount: number;
  id: number;
};

async function validatePromo(
  raw: string | undefined,
  subtotal: number
): Promise<{ promo?: ValidatedPromo; error?: string }> {
  const code = (raw ?? "").trim().toUpperCase();
  if (!code) return {};
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("promo_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error || !data) return { error: "Code promo invalide." };
  const promo = mapPromoCode(data as unknown as PromoCodeRow);
  if (!promo.active) return { error: "Code promo expiré ou désactivé." };
  if (promo.expiresAt && Date.now() > promo.expiresAt) {
    return { error: "Code promo expiré." };
  }
  if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
    return { error: "Code promo épuisé." };
  }
  if (subtotal < promo.minAmount) {
    const { formatPrice } = await import("@/lib/format");
    return {
      error: `Code promo valable à partir de ${formatPrice(promo.minAmount)} d'achat.`,
    };
  }
  const discount =
    promo.type === "percent"
      ? Math.round((subtotal * promo.value) / 100)
      : Math.min(promo.value, subtotal);
  if (discount <= 0) return { error: "Code promo sans effet sur ce panier." };
  return { promo: { code: promo.code, type: promo.type, discount, id: promo.id } };
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Stripe n'est pas configuré. Ajoute STRIPE_SECRET_KEY dans .env.local (clés de test) puis relance le serveur.",
      },
      { status: 503 }
    );
  }

  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const email = String(body.customerEmail ?? "").trim();
  const name = String(body.customerName ?? "").trim();
  const line1 = String(body.addressLine1 ?? "").trim();
  const city = String(body.addressCity ?? "").trim();
  const postal = String(body.addressPostalCode ?? "").trim();
  const country = String(body.addressCountry ?? "FR").trim().toUpperCase() || "FR";

  if (items.length === 0) {
    return NextResponse.json({ error: "Le panier est vide." }, { status: 400 });
  }
  if (!email || !name || !line1 || !city || !postal) {
    return NextResponse.json(
      { error: "Veuillez remplir toutes les informations de livraison." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Adresse e-mail invalide." },
      { status: 400 }
    );
  }

  // On ne fait JAMAIS confiance au client : relecture des produits en base.
  const ids = items.map((i) => Number(i.productId)).filter(Number.isFinite);
  if (ids.length !== items.length) {
    return NextResponse.json(
      { error: "Article invalide dans le panier." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: productRows, error: productsError } = await admin
    .from("products")
    .select("*")
    .in("id", ids);

  if (productsError || !Array.isArray(productRows)) {
    return NextResponse.json(
      { error: "Erreur lors de la lecture du catalogue." },
      { status: 500 }
    );
  }

  const productById = new Map(
    (productRows as unknown as ProductRow[]).map((p) => [mapProduct(p).id, mapProduct(p)])
  );

  const shortages: string[] = [];
  const lineItems: { id: number; quantity: number; price: number; name: string; image: string }[] = [];

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product || !product.active) {
      return NextResponse.json(
        { error: "Un article du panier n'existe plus." },
        { status: 400 }
      );
    }
    const quantity = Math.floor(Number(item.quantity));
    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Quantité invalide pour " + product.name + "." },
        { status: 400 }
      );
    }
    if (product.stock < quantity) {
      shortages.push(
        `${product.name} (stock disponible : ${product.stock})`
      );
      continue;
    }
    lineItems.push({
      id: product.id,
      quantity,
      price: product.price,
      name: product.name,
      image: product.imageUrl,
    });
  }

  if (shortages.length > 0) {
    return NextResponse.json(
      {
        error:
          "Stock insuffisant pour : " +
          shortages.join(", ") +
          ". Réduisez les quantités dans votre panier.",
      },
      { status: 409 }
    );
  }

  const subtotal = lineItems.reduce(
    (sum, li) => sum + li.price * li.quantity,
    0
  );

  const { promo, error: promoError } = await validatePromo(body.promoCode, subtotal);
  if (promoError) {
    return NextResponse.json({ error: promoError }, { status: 400 });
  }
  const discount = promo?.discount ?? 0;

  // Livraison : serveur seul décide du prix (jamais confiance client).
  const carrier = body.carrier === "relais" ? "relais" : "domicile";
  let shippingPrice = 0;
  let shippingLabel = "Livraison standard (offerte)";
  try {
    const { getShippingRates } = await import("@/lib/queries");
    const rates = await getShippingRates(country);
    const match =
      rates.find((r) =>
        carrier === "relais"
          ? r.label.toLowerCase().includes("relais")
          : r.price === 0
      ) ?? rates[0];
    if (match) {
      shippingPrice = Number(match.price ?? 0);
      shippingLabel = match.label;
    } else if (carrier === "relais") {
      shippingPrice = 490;
      shippingLabel = "Point relais";
    }
  } catch {
    shippingPrice = carrier === "relais" ? 490 : 0;
    shippingLabel = carrier === "relais" ? "Point relais" : "Livraison standard (offerte)";
  }
  const amountTotal = subtotal - discount + shippingPrice;

  // Compte connecté ? (optionnel : le paiement invité reste possible)
  let userId: string | null = null;
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null;
  }

  let orderId: number;
  try {
    const insertPayload: Record<string, unknown> = {
      status: "pending",
      user_id: userId,
      customer_email: email,
      customer_name: name,
      address_line1: line1,
      address_city: city,
      address_postal_code: postal,
      address_country: country,
      amount_total: amountTotal,
      promo_code: promo?.code ?? null,
      discount_amount: discount,
    };
    // Colonnes migration (tolérant si non jouée : on réessaie sans).
    const withShipping = {
      ...insertPayload,
      carrier,
      shipping_price: shippingPrice,
    };
    let inserted: unknown = null;
    let insertError: unknown = null;
    const tryInsert = await admin.from("orders").insert(withShipping).select("id").single();
    if (tryInsert.error) {
      const fallback = await admin.from("orders").insert(insertPayload).select("id").single();
      inserted = fallback.data;
      insertError = fallback.error;
    } else {
      inserted = tryInsert.data;
    }
    if (insertError || !inserted) throw insertError ?? new Error("insert order");
    orderId = Number((inserted as unknown as { id: number }).id);

    const { error: itemsError } = await admin.from("order_items").insert(
      lineItems.map((li) => ({
        order_id: orderId,
        product_id: li.id,
        product_name: li.name,
        unit_price: li.price,
        quantity: li.quantity,
      }))
    );
    if (itemsError) throw itemsError;
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande." },
      { status: 500 }
    );
  }

  try {
    const appUrl = requireEnv("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");

    // Coupon Stripe à usage unique pour la remise (le cas échéant).
    let discounts: { coupon: string }[] | undefined;
    if (promo && discount > 0) {
      const coupon = await stripe.coupons.create(
        promo.type === "percent"
          ? {
              percent_off: Math.min(
                100,
                Math.round((discount / subtotal) * 10000) / 100
              ),
              duration: "once",
              name: promo.code,
            }
          : { amount_off: discount, currency: "eur", duration: "once", name: promo.code }
      );
      discounts = [{ coupon: coupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: String(orderId),
      payment_method_types: ["card"],
      line_items: lineItems.map((li) => ({
        price_data: {
          currency: "eur",
          unit_amount: li.price,
          product_data: {
            name: li.name,
            // Stripe n'accepte que des URLs absolues https et publiquement
            // accessibles. Les images locales (/assets/...) ne sont pas
            // récupérables par Stripe en dev : on les omet au lieu de
            // faire échouer toute la session.
            images:
              li.image && li.image.startsWith("https://")
                ? [li.image]
                : undefined,
          },
        },
        quantity: li.quantity,
      })),
      discounts,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingPrice, currency: "eur" },
            display_name: shippingLabel,
          },
        },
      ],
      metadata: {
        order_id: String(orderId),
        ...(promo ? { promo_code: promo.code } : {}),
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel?order_id=${orderId}`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30,
    });

    await admin
      .from("orders")
      .update({ stripe_session_id: session.id, updated_at: Date.now() })
      .eq("id", orderId);

    if (!session.url) {
      throw new Error("Stripe n'a retourné aucune URL de paiement.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Log serveur pour diagnostiquer (clé invalide, URL image, etc.).
    // Le message détaillé ne remonte jamais au client.
    console.error("[checkout] échec création session Stripe :", error);
    // Nettoyage de la commande orpheline si la session Stripe échoue.
    await admin.from("order_items").delete().eq("order_id", orderId);
    await admin.from("orders").delete().eq("id", orderId);
    return NextResponse.json(
      { error: "Impossible de créer la session Stripe." },
      { status: 502 }
    );
  }
}
