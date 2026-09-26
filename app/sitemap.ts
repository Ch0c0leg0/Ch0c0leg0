import type { MetadataRoute } from "next";
import { getActiveProducts, getCategories } from "@/lib/queries";

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const now = new Date();
  const [products, cats] = await Promise.all([
    getActiveProducts().catch(() => []),
    getCategories().catch(() => []),
  ]);
  const staticRoutes = [
    "",
    "/products",
    "/categories",
    "/contact",
    "/aide",
    "/suivi",
    "/livraison-retours",
    "/cgv",
    "/mentions-legales",
    "/confidentialite",
    "/cookies",
    "/guides",
  ].map((p) => ({ url: `${base}${p || "/"}`, lastModified: now }));
  const productRoutes = products.slice(0, 500).map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt || Date.now()),
  }));
  const catRoutes = cats.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: now,
  }));
  return [...staticRoutes, ...productRoutes, ...catRoutes];
}
