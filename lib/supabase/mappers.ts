import type { Database } from "./database";
import { resolvePublicImageUrl } from "@/lib/images-server";
import type {
  Category,
  CategoryRow,
  OrderItem,
  OrderItemRow,
  OrderRow,
  OrderWithItems,
  Product,
  ProductRow,
  Profile,
  ProfileRow,
  PromoCode,
  PromoCodeRow,
} from "./types";

export type {
  Category,
  CategoryRow,
  Database,
  OrderItem,
  OrderItemRow,
  OrderRow,
  OrderWithItems,
  Product,
  ProductRow,
  Profile,
  ProfileRow,
  PromoCode,
  PromoCodeRow,
};

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/* ---------- Categories ---------- */

export function mapCategory(row: CategoryRow): Category {
  return {
    id: toNumber(row.id),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    icon: String(row.icon ?? "Gamepad2"),
    createdAt: toNumber(row.created_at),
  };
}

/* ---------- Products ---------- */

export function mapProduct(row: ProductRow): Product {
  return {
    id: toNumber(row.id),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    price: toNumber(row.price),
    compareAtPrice: toNullableNumber(row.compare_at_price),
    stock: toNumber(row.stock),
    imageUrl: resolvePublicImageUrl(row.image_url),
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    categoryId: toNullableNumber(row.category_id),
    createdAt: toNumber(row.created_at),
    updatedAt: toNumber(row.updated_at),
  };
}

/* ---------- Profiles ---------- */

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: String(row.id ?? ""),
    displayName: String(row.display_name ?? ""),
    email: String(row.email ?? ""),
    bio: String(row.bio ?? ""),
    pronouns: String(row.pronouns ?? ""),
    statusText: String(row.status_text ?? ""),
    avatarUrl: String(row.avatar_url ?? ""),
    avatarDecoration: String(row.avatar_decoration ?? "none"),
    profileFrame: String(row.profile_frame ?? "none"),
    banner: String(row.banner ?? "sunset"),
    accentColor: String(row.accent_color ?? "coral"),
    nameStyle: String(row.name_style ?? "default"),
    nameplate: String(row.nameplate ?? "none"),
    profileEffect: String(row.profile_effect ?? "none"),
    addressLine1: String(row.address_line1 ?? ""),
    addressCity: String(row.address_city ?? ""),
    addressPostalCode: String(row.address_postal_code ?? ""),
    addressCountry: String(row.address_country ?? "FR"),
    lastSeenAt: toNullableNumber(
      (row as unknown as { last_seen_at?: unknown }).last_seen_at ?? null
    ),
    createdAt: toNumber(row.created_at),
    updatedAt: toNumber(row.updated_at),
  };
}

/* ---------- Promo codes ---------- */

export function mapPromoCode(row: PromoCodeRow): PromoCode {
  const type = row.type === "amount" ? "amount" : "percent";
  return {
    id: toNumber(row.id),
    code: String(row.code ?? "").toUpperCase(),
    type,
    value: toNumber(row.value),
    minAmount: toNumber(row.min_amount),
    active: Boolean(row.active),
    expiresAt: toNullableNumber(row.expires_at),
    usageLimit: toNullableNumber(row.usage_limit),
    usedCount: toNumber(row.used_count),
    createdAt: toNumber(row.created_at),
  };
}

/* ---------- Orders ---------- */

export function mapOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: toNumber(row.id),
    orderId: toNumber(row.order_id),
    productId: toNullableNumber(row.product_id),
    productName: String(row.product_name ?? ""),
    unitPrice: toNumber(row.unit_price),
    quantity: toNumber(row.quantity, 1),
  };
}

export function mapOrder(row: OrderRow, items: OrderItemRow[] = []): OrderWithItems {
  return {
    id: toNumber(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    stripeSessionId: row.stripe_session_id ? String(row.stripe_session_id) : null,
    stripePaymentIntentId: row.stripe_payment_intent_id
      ? String(row.stripe_payment_intent_id)
      : null,
    status: String(row.status ?? "pending"),
    customerEmail: String(row.customer_email ?? ""),
    customerName: String(row.customer_name ?? ""),
    addressLine1: String(row.address_line1 ?? ""),
    addressCity: String(row.address_city ?? ""),
    addressPostalCode: String(row.address_postal_code ?? ""),
    addressCountry: String(row.address_country ?? "FR"),
    amountTotal: toNumber(row.amount_total),
    promoCode: row.promo_code ? String(row.promo_code) : null,
    discountAmount: toNumber(row.discount_amount),
    carrier: String((row as unknown as { carrier?: unknown }).carrier ?? "domicile"),
    trackingNumber: String(
      (row as unknown as { tracking_number?: unknown }).tracking_number ?? ""
    ),
    shippingPrice: toNumber(
      (row as unknown as { shipping_price?: unknown }).shipping_price ?? 0
    ),
    invoiceNumber:
      (row as unknown as { invoice_number?: unknown }).invoice_number != null
        ? String((row as unknown as { invoice_number?: unknown }).invoice_number)
        : null,
    createdAt: toNumber(row.created_at),
    updatedAt: toNumber(row.updated_at),
    items: items.map(mapOrderItem),
  };
}
