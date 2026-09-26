import { createAdminClient } from "@/lib/supabase/admin";
import { resolvePublicImageUrl } from "@/lib/images-server";
import { mapCategory, mapProduct } from "@/lib/supabase/mappers";
import type {
  Category,
  CategoryRow,
  Product,
  ProductRow,
} from "@/lib/supabase/types";

/* Couche de lecture catalogue — Supabase (serveur).
   Toutes les fonctions sont async (PostgREST) et renvoient
   des objets camelCase stables pour l'UI. */

function db() {
  return createAdminClient();
}

function rows<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : [];
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await db()
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    console.error("[queries] getCategories :", error.message);
    return [];
  }
  return rows<CategoryRow>(data).map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await db()
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return mapCategory(data as unknown as CategoryRow);
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await db()
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[queries] getFeaturedProducts :", error.message);
    return [];
  }
  return rows<ProductRow>(data).map(mapProduct);
}

export async function getNewProducts(limit = 4): Promise<Product[]> {
  const { data, error } = await db()
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[queries] getNewProducts :", error.message);
    return [];
  }
  return rows<ProductRow>(data).map(mapProduct);
}

export async function getActiveProducts(opts?: {
  categorySlug?: string;
  q?: string;
  sort?: string;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  minRating?: number;
}): Promise<Product[]> {
  let categoryId: number | null = null;
  if (opts?.categorySlug) {
    const cat = await getCategoryBySlug(opts.categorySlug);
    if (!cat) return [];
    categoryId = cat.id;
  }

  let query = db().from("products").select("*").eq("active", true);

  if (categoryId !== null) {
    query = query.eq("category_id", categoryId);
  }

  if (opts?.q) {
    const term = `%${opts.q}%`;
    query = query.or(`name.ilike.${term},description.ilike.${term}`);
  }

  if (opts?.maxPrice && opts.maxPrice > 0) {
    query = query.lte("price", Math.round(opts.maxPrice * 100));
  }
  if (opts?.inStock) {
    query = query.gt("stock", 0);
  }

  if (opts?.sort === "price-asc") {
    query = query.order("price", { ascending: true });
  } else if (opts?.sort === "price-desc") {
    query = query.order("price", { ascending: false });
  } else if (opts?.sort === "name") {
    query = query.order("name", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("[queries] getActiveProducts :", error.message);
    return [];
  }
  let products = rows<ProductRow>(data).map(mapProduct);

  // Filtres calculés côté JS (promo réelle, note moyenne).
  if (opts?.onSale) {
    products = products.filter(
      (p) => p.compareAtPrice !== null && p.compareAtPrice > p.price
    );
  }
  if (opts?.minRating && opts.minRating > 0) {
    const { getRatingSummaries } = await import("@/lib/reviews");
    const summaries = await getRatingSummaries(
      products.map((p) => p.id)
    ).catch(() => new Map());
    products = products.filter(
      (p) => (summaries.get(p.id)?.average ?? 0) >= (opts.minRating ?? 0)
    );
  }
  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await db()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error || !data) return null;
  return mapProduct(data as unknown as ProductRow);
}

export async function getProductWithCategory(slug: string): Promise<
  (Product & { category: Category | null }) | null
> {
  const product = await getProductBySlug(slug);
  if (!product) return null;
  let category: Category | null = null;
  if (product.categoryId !== null) {
    const { data } = await db()
      .from("categories")
      .select("*")
      .eq("id", product.categoryId)
      .maybeSingle();
    if (data) category = mapCategory(data as unknown as CategoryRow);
  }
  return { ...product, category };
}

export async function getRelatedProducts(
  productId: number,
  categoryId: number | null,
  limit = 4
): Promise<Product[]> {
  if (!categoryId) return [];
  const { data, error } = await db()
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("category_id", categoryId)
    .neq("id", productId)
    .limit(limit);
  if (error) {
    console.error("[queries] getRelatedProducts :", error.message);
    return [];
  }
  return rows<ProductRow>(data).map(mapProduct);
}

export async function getCategoryCount(): Promise<number> {
  const { count, error } = await db()
    .from("categories")
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

export type CategoryWithCount = Category & { productCount: number };

/** Catégories + nombre de produits actifs (pour le hub /categories). */
export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const [cats, { data }] = await Promise.all([
    getCategories(),
    db().from("products").select("category_id").eq("active", true),
  ]);
  const counts = new Map<number, number>();
  if (Array.isArray(data)) {
    for (const r of data as unknown as { category_id: number | null }[]) {
      if (r.category_id === null) continue;
      counts.set(r.category_id, (counts.get(r.category_id) ?? 0) + 1);
    }
  }
  return cats.map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }));
}

/* ============ Admin ============ */

export type AdminProduct = Product & {
  categoryName: string | null;
};

export async function getProductsAdmin(): Promise<AdminProduct[]> {
  const { data, error } = await db()
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[queries] getProductsAdmin :", error.message);
    return [];
  }
  return rows<ProductRow & { categories: { name: string } | null }>(data).map(
    (row) => ({
      ...mapProduct(row),
      categoryName: row.categories?.name ?? null,
    })
  );
}

export async function getProductById(id: number): Promise<Product | null> {
  const { data, error } = await db()
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapProduct(data as unknown as ProductRow);
}

/* ---------- Extensions discrètes (tolérantes si migration non jouée) ---------- */

export type ProductImage = { id: number; productId: number; url: string; position: number };

export async function getProductImages(productId: number): Promise<ProductImage[]> {
  try {
    const { data, error } = await db()
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("position", { ascending: true });
    if (error || !Array.isArray(data)) return [];
    return (data as unknown as { id: unknown; product_id: unknown; url: unknown; position: unknown }[]).map(
      (r) => ({
        id: Number(r.id ?? 0),
        productId: Number(r.product_id ?? productId),
        url: resolvePublicImageUrl(r.url),
        position: Number(r.position ?? 0),
      })
    );
  } catch {
    return [];
  }
}

export type ShippingRate = { id: number; zone: string; label: string; price: number; minAmount: number };

export async function getShippingRates(zone = "FR"): Promise<ShippingRate[]> {
  try {
    const { data, error } = await db()
      .from("shipping_rates")
      .select("*")
      .eq("zone", zone)
      .eq("active", true)
      .order("price", { ascending: true });
    if (error || !Array.isArray(data)) throw error ?? new Error("empty");
    return (data as unknown as { id: unknown; zone: unknown; label: unknown; price: unknown; min_amount: unknown }[]).map(
      (r) => ({
        id: Number(r.id ?? 0),
        zone: String(r.zone ?? zone),
        label: String(r.label ?? ""),
        price: Number(r.price ?? 0),
        minAmount: Number(r.min_amount ?? 0),
      })
    );
  } catch {
    return [
      { id: 1, zone, label: "Domicile offerte", price: 0, minAmount: 0 },
      { id: 2, zone, label: "Point relais", price: 490, minAmount: 0 },
    ];
  }
}

export type ProductWithCategory = Product & {
  category: Category | null;
};

export async function getProductWithCategoryById(
  id: number
): Promise<ProductWithCategory | null> {
  const product = await getProductById(id);
  if (!product) return null;
  let category: Category | null = null;
  if (product.categoryId !== null) {
    const { data } = await db()
      .from("categories")
      .select("*")
      .eq("id", product.categoryId)
      .maybeSingle();
    if (data) category = mapCategory(data as unknown as CategoryRow);
  }
  return { ...product, category };
}
