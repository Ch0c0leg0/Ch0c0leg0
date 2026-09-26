import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowDownWideNarrow, ChevronRight } from "lucide-react";
import { getActiveProducts, getCategories, getCategoryBySlug } from "@/lib/queries";
import { ProductGrid } from "@/components/product-grid";
import { CategoryIcon } from "@/components/category-icon";
import { SplitTitle } from "@/components/motion/split-title";
import { cn } from "@/lib/cn";

const SORTS = [
  { key: "", label: "Pertinence" },
  { key: "price-asc", label: "Prix croissant" },
  { key: "price-desc", label: "Prix décroissant" },
  { key: "name", label: "Nom (A-Z)" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Catégorie introuvable" };
  return {
    title: category.name,
    description: `Tous nos ${category.name.toLowerCase()} gaming. Testés. Triés. Sans blabla.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const sort = typeof sp.sort === "string" ? sp.sort : "";

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [products, categories] = await Promise.all([
    getActiveProducts({ categorySlug: slug, sort: sort || undefined }),
    getCategories(),
  ]);

  const buildSortHref = (key: string) =>
    `/categories/${slug}${key ? `?sort=${key}` : ""}`;

  return (
    <div>
      {/* Hero catégorie */}
      <section className="section-dark relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-coral/10 blur-[110px]" />
        </div>
        <CategoryIcon
          name={category.icon}
          className="pointer-events-none absolute -right-8 top-1/2 hidden h-64 w-64 -translate-y-1/2 text-cream/[0.05] md:block"
        />
        <div className="container-page relative py-12 md:py-16">
          <nav className="mb-6 flex items-center gap-1.5 text-sm text-cream/50">
            <Link href="/" className="transition-colors hover:text-cream">
              Accueil
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/categories" className="transition-colors hover:text-cream">
              Catégories
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-cream">{category.name}</span>
          </nav>
          <div className="flex items-center gap-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-coral text-white shadow-warm">
              <CategoryIcon name={category.icon} className="h-8 w-8" />
            </span>
            <div>
              <SplitTitle
                as="h1"
                immediate
                text={category.name}
                className="display-section font-display text-cream"
              />
              <p className="mt-1 text-sm text-cream/60">
                {products.length} produit{products.length > 1 ? "s" : ""}. Fais
                le tri.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-10">
        {/* Autres catégories */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5",
                c.slug === slug
                  ? "border-espresso bg-espresso text-cream shadow-warm"
                  : "border-espresso/15 bg-white text-cocoa hover:border-espresso"
              )}
            >
              <CategoryIcon
                name={c.icon}
                className={cn("h-4 w-4", c.slug === slug ? "text-honey" : "text-coral")}
              />
              {c.name}
            </Link>
          ))}
        </div>

        {/* Tri */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm">
          <span className="mr-1 inline-flex items-center gap-1.5 font-semibold text-cocoa/60">
            <ArrowDownWideNarrow className="h-4 w-4" /> Trier :
          </span>
          {SORTS.map((s) => (
            <Link
              key={s.key}
              href={buildSortHref(s.key)}
              className={cn(
                "rounded-xl px-3 py-1.5 font-semibold transition-colors",
                sort === s.key
                  ? "bg-espresso text-cream"
                  : "text-cocoa/60 hover:bg-espresso/5 hover:text-espresso"
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <ProductGrid products={products} />
      </div>
    </div>
  );
}
