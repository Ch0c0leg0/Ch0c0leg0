/* Lignes brutes Supabase (snake_case, telles que renvoyées par PostgREST). */

export type CategoryRow = {
  id: number | string;
  name: string;
  slug: string;
  icon?: string | null;
  created_at?: number | string | null;
};

export type ProductRow = {
  id: number | string;
  slug: string;
  name: string;
  description?: string | null;
  price: number | string;
  compare_at_price?: number | string | null;
  stock?: number | string | null;
  image_url?: string | null;
  active?: boolean | null;
  featured?: boolean | null;
  category_id?: number | string | null;
  created_at?: number | string | null;
  updated_at?: number | string | null;
};

export type ProfileRow = {
  id: string;
  display_name?: string | null;
  email?: string | null;
  bio?: string | null;
  pronouns?: string | null;
  status_text?: string | null;
  avatar_url?: string | null;
  avatar_decoration?: string | null;
  profile_frame?: string | null;
  banner?: string | null;
  accent_color?: string | null;
  name_style?: string | null;
  nameplate?: string | null;
  profile_effect?: string | null;
  address_line1?: string | null;
  address_city?: string | null;
  address_postal_code?: string | null;
  address_country?: string | null;
  referral_code?: string | null;
  referred_by?: string | null;
  last_seen_at?: number | string | null;
  created_at?: number | string | null;
  updated_at?: number | string | null;
};

export type PromoCodeRow = {
  id: number | string;
  code: string;
  type?: string | null;
  value: number | string;
  min_amount?: number | string | null;
  active?: boolean | null;
  expires_at?: number | string | null;
  usage_limit?: number | string | null;
  used_count?: number | string | null;
  created_at?: number | string | null;
};

export type OrderRow = {
  id: number | string;
  user_id?: string | null;
  stripe_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  status?: string | null;
  customer_email: string;
  customer_name: string;
  address_line1: string;
  address_city: string;
  address_postal_code: string;
  address_country?: string | null;
  amount_total: number | string;
  promo_code?: string | null;
  discount_amount?: number | string | null;
  carrier?: string | null;
  tracking_number?: string | null;
  shipping_price?: number | string | null;
  invoice_number?: string | null;
  created_at?: number | string | null;
  updated_at?: number | string | null;
};

export type OrderItemRow = {
  id: number | string;
  order_id: number | string;
  product_id?: number | string | null;
  product_name: string;
  unit_price: number | string;
  quantity?: number | string | null;
};

/* ---------- Types applicatifs (camelCase, stables pour l'UI) ---------- */

export type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  createdAt: number;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string;
  active: boolean;
  featured: boolean;
  categoryId: number | null;
  createdAt: number;
  updatedAt: number;
};

export type Profile = {
  id: string;
  displayName: string;
  email: string;
  bio: string;
  pronouns: string;
  statusText: string;
  avatarUrl: string;
  avatarDecoration: string;
  profileFrame: string;
  banner: string;
  accentColor: string;
  nameStyle: string;
  nameplate: string;
  profileEffect: string;
  addressLine1: string;
  addressCity: string;
  addressPostalCode: string;
  addressCountry: string;
  lastSeenAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type PromoCode = {
  id: number;
  code: string;
  type: "percent" | "amount";
  value: number;
  minAmount: number;
  active: boolean;
  expiresAt: number | null;
  usageLimit: number | null;
  usedCount: number;
  createdAt: number;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number | null;
  productName: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: number;
  userId: string | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  status: string;
  customerEmail: string;
  customerName: string;
  addressLine1: string;
  addressCity: string;
  addressPostalCode: string;
  addressCountry: string;
  amountTotal: number;
  promoCode: string | null;
  discountAmount: number;
  carrier: string;
  trackingNumber: string;
  shippingPrice: number;
  invoiceNumber: string | null;
  createdAt: number;
  updatedAt: number;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
};
