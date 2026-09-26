"use client";

import { useState } from "react";
import { PackagePlus, Check } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { openCartDrawer } from "@/components/cart/cart-drawer";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/supabase/types";

/** Bouton pack discret : ajoute produit + similaires en 1 clic. */
export function PackAddButton({ main, related }: { main: Product; related: Product[] }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const items = [main, ...related.slice(0, 2)].filter((p) => p.stock > 0);
  if (items.length < 2) return null;
  const total = items.reduce((s, p) => s + p.price, 0);

  function addPack() {
    for (const p of items) {
      addItem(
        { productId: p.id, slug: p.slug, name: p.name, price: p.price, imageUrl: p.imageUrl, stock: p.stock },
        1
      );
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
    window.setTimeout(() => openCartDrawer(), 450);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-espresso/20 bg-cream/60 px-4 py-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
        <PackagePlus className="h-4 w-4" />
      </span>
      <p className="min-w-0 flex-1 text-sm text-cocoa/75">
        <span className="font-semibold text-espresso">Souvent ensemble</span> · {items.length} articles ·{" "}
        {formatPrice(total)}
      </p>
      <button type="button" onClick={addPack} className="btn-outline ml-auto text-sm">
        {added ? (
          <>
            <Check className="h-4 w-4" /> Pack ajouté
          </>
        ) : (
          <>
            <PackagePlus className="h-4 w-4" /> Ajouter le pack
          </>
        )}
      </button>
    </div>
  );
}
