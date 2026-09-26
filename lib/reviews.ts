import { createAdminClient } from "@/lib/supabase/admin";

export type Review = {
  id: number;
  productId: number;
  userId: string;
  displayName: string;
  rating: number;
  title: string;
  body: string;
  status: string;
  createdAt: number;
  verified: boolean;
  helpfulCount: number;
  merchantReply: string;
};

export type ReviewRow = {
  id: number | string;
  product_id: number | string;
  user_id: string;
  display_name?: string | null;
  rating: number | string;
  title?: string | null;
  body?: string | null;
  status?: string | null;
  created_at?: number | string | null;
  helpful_count?: number | string | null;
  merchant_reply?: string | null;
};

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapReview(row: ReviewRow, verifiedIds: Set<number>): Review {
  return {
    id: toNumber(row.id),
    productId: toNumber(row.product_id),
    userId: String(row.user_id ?? ""),
    displayName: String(row.display_name ?? "Joueur anonyme"),
    rating: Math.min(5, Math.max(1, toNumber(row.rating, 5))),
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    status: String(row.status ?? "pending"),
    createdAt: toNumber(row.created_at),
    verified: verifiedIds.has(toNumber(row.product_id)),
    helpfulCount: toNumber(row.helpful_count ?? 0),
    merchantReply: String(row.merchant_reply ?? ""),
  };
}

/** IDs produits achetés (commande payée) par un compte. */
async function verifiedProductIds(userId: string): Promise<Set<number>> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "paid");
  if (!Array.isArray(data) || data.length === 0) return new Set();
  const orderIds = (data as unknown as { id: number }[]).map((o) =>
    Number(o.id)
  );
  const { data: items } = await admin
    .from("order_items")
    .select("product_id")
    .in("order_id", orderIds);
  const set = new Set<number>();
  if (Array.isArray(items)) {
    for (const it of items as unknown as { product_id: number | null }[]) {
      if (it.product_id !== null) set.add(Number(it.product_id));
    }
  }
  return set;
}

/** Avis approuvés d'un produit (+ badge achat vérifié calculé). */
export async function getApprovedReviews(
  productId: number,
  viewerUserId?: string | null
): Promise<Review[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !Array.isArray(data)) return [];

  // Achat vérifié : pour chaque auteur, a-t-il payé ce produit ?
  const authorIds = [
    ...new Set(
      (data as unknown as ReviewRow[]).map((r) => String(r.user_id ?? ""))
    ),
  ].filter(Boolean);
  const verifiedByAuthor = new Map<string, boolean>();
  await Promise.all(
    authorIds.map(async (authorId) => {
      const set = await verifiedProductIds(authorId);
      verifiedByAuthor.set(authorId, set.has(productId));
    })
  );

  return (data as unknown as ReviewRow[]).map((row) => ({
    ...mapReview(row, new Set<number>()),
    verified: verifiedByAuthor.get(String(row.user_id ?? "")) ?? false,
  }));
}

export type RatingSummary = { average: number; count: number };

/** Moyenne + compteur par produit (un seul appel pour N produits). */
export async function getRatingSummaries(
  productIds: number[]
): Promise<Map<number, RatingSummary>> {
  const map = new Map<number, RatingSummary>();
  if (productIds.length === 0) return map;
  const admin = createAdminClient();
  const { data } = await admin
    .from("reviews")
    .select("product_id,rating")
    .in("product_id", productIds)
    .eq("status", "approved");
  const acc = new Map<number, { sum: number; n: number }>();
  if (Array.isArray(data)) {
    for (const r of data as unknown as {
      product_id: number;
      rating: number;
    }[]) {
      const id = Number(r.product_id);
      const cur = acc.get(id) ?? { sum: 0, n: 0 };
      cur.sum += Number(r.rating ?? 0);
      cur.n += 1;
      acc.set(id, cur);
    }
  }
  for (const [id, { sum, n }] of acc) {
    map.set(id, { average: n ? sum / n : 0, count: n });
  }
  return map;
}

/** Derniers avis approuvés (bandeau accueil). */
export async function getLatestReviews(
  limit = 4
): Promise<(Review & { productName: string; productSlug: string })[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .select("*, products(name,slug)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !Array.isArray(data)) return [];
  return (
    data as unknown as (ReviewRow & {
      products: { name: string; slug: string } | null;
    })[]
  ).map((row) => ({
    ...mapReview(row, new Set<number>()),
    productName: row.products?.name ?? "",
    productSlug: row.products?.slug ?? "",
  }));
}

/** Avis du compte connecté pour un produit (quel que soit le statut). */
export async function getMyReviewForProduct(
  productId: number,
  userId: string
): Promise<Review | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return null;
  return mapReview(data as unknown as ReviewRow, new Set<number>());
}

/** Tous les avis d'un compte (page Mes avis). */
export async function getMyReviews(userId: string): Promise<
  (Review & { productName: string; productSlug: string })[]
> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("reviews")
    .select("*, products(name,slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (!Array.isArray(data)) return [];
  return (
    data as unknown as (ReviewRow & {
      products: { name: string; slug: string } | null;
    })[]
  ).map((row) => ({
    ...mapReview(row, new Set<number>()),
    productName: row.products?.name ?? "Produit retiré",
    productSlug: row.products?.slug ?? "",
  }));
}

/** Nombre d'avis en attente (pastille admin). */
export async function getPendingReviewCount(): Promise<number> {
  const { count } = await createAdminClient()
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}
