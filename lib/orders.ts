import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapOrder } from "@/lib/supabase/mappers";
import type {
  Order,
  OrderItemRow,
  OrderRow,
  OrderWithItems,
} from "@/lib/supabase/types";
import type Stripe from "stripe";

export type { Order, OrderWithItems };

async function fetchOrderWithItems(orderRow: OrderRow): Promise<OrderWithItems> {
  const admin = createAdminClient();
  const orderId = Number(orderRow.id);
  const { data } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);
  const items = Array.isArray(data) ? (data as unknown as OrderItemRow[]) : [];
  return mapOrder(orderRow, items);
}

export async function getOrderByStripeSession(
  sessionId: string,
  withItems: true
): Promise<OrderWithItems | null>;
export async function getOrderByStripeSession(
  sessionId: string,
  withItems?: false
): Promise<Order | null>;
export async function getOrderByStripeSession(
  sessionId: string,
  withItems = true
): Promise<Order | OrderWithItems | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as unknown as OrderRow;
  if (!withItems) {
    const { items: _items, ...order } = mapOrder(row, []);
    return order;
  }
  return fetchOrderWithItems(row);
}

export async function getOrderById(
  id: number,
  withItems: true
): Promise<OrderWithItems | null>;
export async function getOrderById(
  id: number,
  withItems?: false
): Promise<Order | null>;
export async function getOrderById(
  id: number,
  withItems = true
): Promise<Order | OrderWithItems | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as unknown as OrderRow;
  if (!withItems) {
    const { items: _items, ...order } = mapOrder(row, []);
    return order;
  }
  return fetchOrderWithItems(row);
}

/** Commandes d'un compte client (les plus récentes d'abord). */
export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("[orders] getUserOrders :", error.message);
    return [];
  }
  if (!Array.isArray(data)) return [];
  return (data as unknown as (OrderRow & { order_items: OrderItemRow[] })[]).map(
    (row) => mapOrder(row, row.order_items ?? [])
  );
}

/**
 * Confirme une commande après un paiement Stripe réussi.
 * Idempotent : ne décompte le stock qu'une seule fois.
 */
export async function confirmOrder(session: Stripe.Checkout.Session) {
  if (!session.id) return { ok: false, reason: "no-session-id" as const };

  const order = await getOrderByStripeSession(session.id, true);
  if (!order) return { ok: false, reason: "order-not-found" as const };

  if (order.status === "paid") {
    return { ok: true, reason: "already-confirmed" as const, order };
  }

  const admin = createAdminClient();

  // Numéro de facture discret : AAAA-000123 (tolérant si colonne absente).
  const year = new Date().getFullYear();
  const invoiceNumber = `${year}-${String(order.id).padStart(6, "0")}`;
  try {
    await admin
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        invoice_number: invoiceNumber,
        updated_at: Date.now(),
      })
      .eq("id", order.id);
  } catch {
    await admin
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        updated_at: Date.now(),
      })
      .eq("id", order.id);
  }

  // Comptabilise l'usage du code promo (si présent et encore valide).
  if (order.promoCode) {
    const { data: promoRow } = await admin
      .from("promo_codes")
      .select("used_count")
      .eq("code", order.promoCode)
      .maybeSingle();
    const used = Number(
      (promoRow as unknown as { used_count?: unknown } | null)?.used_count ?? 0
    );
    await admin
      .from("promo_codes")
      .update({ used_count: used + 1 })
      .eq("code", order.promoCode);
  }

  for (const item of order.items) {
    if (!item.productId) continue;
    const { data } = await admin
      .from("products")
      .select("stock")
      .eq("id", item.productId)
      .maybeSingle();
    const current = Number(
      (data as unknown as { stock?: unknown } | null)?.stock ?? 0
    );
    await admin
      .from("products")
      .update({
        stock: Math.max(0, current - item.quantity),
        updated_at: Date.now(),
      })
      .eq("id", item.productId);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/products");

  const refreshed = await getOrderById(order.id, true);
  const finalOrder = refreshed ?? order;

  // E-mail de confirmation discret (n'échoue jamais la commande).
  try {
    const { sendOrderConfirmed } = await import("@/lib/email");
    const { formatPrice } = await import("@/lib/format");
    await sendOrderConfirmed({
      to: finalOrder.customerEmail,
      name: finalOrder.customerName,
      orderId: finalOrder.id,
      totalLabel: formatPrice(finalOrder.amountTotal),
    });
  } catch (e) {
    console.error("[orders] email confirmation :", e);
  }

  return { ok: true, reason: "confirmed" as const, order: finalOrder };
}

export async function getPendingOrderCount(): Promise<number> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) return 0;
  return count ?? 0;
}
