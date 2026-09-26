import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/orders";

/** Suivi invité : n° de commande + e-mail exact (sinon rien ne fuit). */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = Number(body.orderId);
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!Number.isFinite(id) || !email) {
    return NextResponse.json(
      { error: "Numéro et e-mail requis." },
      { status: 400 }
    );
  }
  const order = await getOrderById(id, true);
  if (!order || order.customerEmail.trim().toLowerCase() !== email) {
    // Réponse volontairement floue (anti-énumération).
    return NextResponse.json(
      { error: "Aucune commande trouvée avec ces informations." },
      { status: 404 }
    );
  }
  return NextResponse.json({
    order: {
      id: order.id,
      status: order.status,
      customerName: order.customerName,
      addressLine1: order.addressLine1,
      addressCity: order.addressCity,
      addressPostalCode: order.addressPostalCode,
      addressCountry: order.addressCountry,
      amountTotal: order.amountTotal,
      promoCode: order.promoCode,
      discountAmount: order.discountAmount,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        productName: i.productName,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
      })),
    },
  });
}
