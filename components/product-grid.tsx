import { PackageSearch } from "lucide-react";
import type { Product } from "@/lib/supabase/types";
import { ProductCard } from "@/components/product-card";
import { GsapReveal } from "@/components/motion/gsap-reveal";
import { getRatingSummaries } from "@/lib/reviews";

export async function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-espresso/20 bg-cream-deep/50 px-6 py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-espresso/5 text-cocoa/50">
          <PackageSearch className="h-7 w-7" />
        </span>
        <p className="mt-4 font-display text-lg font-normal text-espresso">
          Rien ici.
        </p>
        <p className="mt-1 text-sm text-cocoa/70">
          Aucun produit ne passe tes filtres. Élargis ou change de recherche.
        </p>
      </div>
    );
  }

  const summaries = await getRatingSummaries(
    products.map((p) => p.id)
  ).catch(() => new Map());

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <GsapReveal key={p.id} delay={Math.min((i % 4) * 0.07, 0.25)}>
          <ProductCard product={p} rating={summaries.get(p.id)} />
        </GsapReveal>
      ))}
    </div>
  );
}
