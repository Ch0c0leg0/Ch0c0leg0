import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDownWideNarrow, RotateCcw } from "lucide-react";
import { getActiveProducts, getCategories, getCategoryBySlug } from "@/lib/queries";
import { ProductGrid } from "@/components/product-grid";
import { CategoryIcon } from "@/components/category-icon";
import { SplitTitle } from "@/components/motion/split-title";
import { FiltersDrawer } from "@/components/products/filters-drawer";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Boutique",
  description: "Tout le matériel gaming Ch0c0leg0.",
};

const SORTS = [
  { key: "", label: "Pertinence" },
  { key: "price-asc", label: "Prix croissant" },
  { key: "price-desc", label: "Prix décroissant" },
  { key: "name", label: "Nom (A-Z)" },
];

type Filters = {
  cat: string;
  q: string;
  sort: string;
  max: string;
  stock: boolean;
  promo: boolean;
  note: string;
};

function FiltersForm({ f, idPrefix }: { f: Filters; idPrefix: string }) {
  return (
    <div className="space-y-4">
      <input type="hidden" name="cat" value={f.cat} />
      <input type="hidden" name="q" value={f.q} />
      <input type="hidden" name="sort" value={f.sort} />
      <div>
        <label className="label" htmlFor={`${idPrefix}-max`}>
          Prix max (€)
        </label>
        <input
          id={`${idPrefix}-max`}
          name="max"
          type="number"
          min={0}
          step={5}
          defaultValue={f.max}
          className="input"
          placeholder="Ex : 150"
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-normal text-espresso">
        <input
          type="checkbox"
          name="stock"
          value="1"
          defaultChecked={f.stock}
          className="h-4 w-4 accent-[#ff6b4a]"
        />
        En stock uniquement
      </label>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-normal text-espresso">
        <input
          type="checkbox"
          name="promo"
          value="1"
          defaultChecked={f.promo}
          className="h-4 w-4 accent-[#ff6b4a]"
        />
        En promo uniquement
      </label>
      <div>
        <label className="label" htmlFor={`${idPrefix}-note`}>
          Note minimale
        </label>
        <select id={`${idPrefix}-note`} name="note" defaultValue={f.note} className="input">
          <option value="">Toutes les notes</option>
          <option value="4">4 étoiles et +</option>
          <option value="3">3 étoiles et +</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1 text-sm">
          Filtrer
        </button>
        <Link
          href={f.cat ? `/products?cat=${f.cat}` : "/products"}
          className="btn-ghost text-sm"
          aria-label="Réinitialiser les filtres"
        >
          <RotateCcw className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    cat?: string;
    q?: string;
    sort?: string;
    max?: string;
    stock?: string;
    promo?: string;
    note?: string;
  }>;
}) {
  const sp = await searchParams;
  const cat = typeof sp.cat === "string" ? sp.cat : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "";
  const max = typeof sp.max === "string" ? sp.max : "";
  const stock = sp.stock === "1";
  const promo = sp.promo === "1";
  const note = typeof sp.note === "string" ? sp.note : "";
  const f: Filters = { cat, q, sort, max, stock, promo, note };

  const categories = await getCategories();
  const activeCat = cat ? await getCategoryBySlug(cat) : null;
  const products = await getActiveProducts({
    categorySlug: cat || undefined,
    q: q || undefined,
    sort: sort || undefined,
    maxPrice: max ? Number(max) : undefined,
    inStock: stock || undefined,
    onSale: promo || undefined,
    minRating: note ? Number(note) : undefined,
  });

  const hasFilters = Boolean(max || stock || promo || note);
  const activeFilterCount = [max, stock, promo, note].filter(Boolean).length;

  const buildHref = (patch: { cat?: string; sort?: string }) => {
    const params = new URLSearchParams();
    const nextCat = patch.cat !== undefined ? patch.cat : cat;
    const nextSort = patch.sort !== undefined ? patch.sort : sort;
    if (nextCat) params.set("cat", nextCat);
    if (q) params.set("q", q);
    if (nextSort) params.set("sort", nextSort);
    if (max) params.set("max", max);
    if (stock) params.set("stock", "1");
    if (promo) params.set("promo", "1");
    if (note) params.set("note", note);
    const qs = params.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SplitTitle
            as="h1"
            text={activeCat ? activeCat.name : q ? `Résultats pour « ${q} »` : "La boutique"}
            className="display-section font-display font-light text-espresso"
          />
          <p className="mt-2 text-sm font-light text-cocoa/65">
            {products.length} article{products.length > 1 ? "s" : ""}
            {activeCat ? ` dans ${activeCat.name}` : ""}
            {hasFilters && ` · ${activeFilterCount} filtre${activeFilterCount > 1 ? "s" : ""}`}
          </p>
        </div>
        <FiltersDrawer count={activeFilterCount}>
          <form method="get" action="/products">
            <FiltersForm f={f} idPrefix="m" />
          </form>
        </FiltersDrawer>
      </div>

      {/* Filtres catégories */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href={buildHref({ cat: "" })}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-normal transition-all duration-300 hover:-translate-y-0.5",
            !cat
              ? "border-espresso bg-espresso text-cream shadow-warm"
              : "border-espresso/15 bg-white text-cocoa hover:border-espresso"
          )}
        >
          Toutes
        </Link>
        {categories.map((c) => {
          const isActive = cat === c.slug;
          return (
            <Link
              key={c.id}
              href={buildHref({ cat: c.slug })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-normal transition-all duration-300 hover:-translate-y-0.5",
                isActive
                  ? "border-espresso bg-espresso text-cream shadow-warm"
                  : "border-espresso/15 bg-white text-cocoa hover:border-espresso"
              )}
            >
              <CategoryIcon
                name={c.icon}
                className={cn("h-4 w-4", isActive ? "text-honey" : "text-coral")}
              />
              {c.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filtres desktop */}
        <aside className="hidden h-fit lg:sticky lg:top-24 lg:block">
          <form method="get" action="/products" className="card space-y-2 p-5">
            <p className="font-display text-lg font-normal text-espresso">
              Affiner
            </p>
            <FiltersForm f={f} idPrefix="d" />
          </form>
        </aside>

        <div className="min-w-0">
          {/* Tri */}
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
            <span className="mr-1 inline-flex items-center gap-1.5 font-normal text-cocoa/60">
              <ArrowDownWideNarrow className="h-4 w-4" /> Trier :
            </span>
            {SORTS.map((s) => (
              <Link
                key={s.key}
                href={buildHref({ sort: s.key })}
                className={cn(
                  "rounded-xl px-3 py-1.5 font-normal transition-colors",
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
    </div>
  );
}
