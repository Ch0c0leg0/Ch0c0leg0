"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartCrack, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/supabase/types";
import type { RatingSummary } from "@/lib/reviews";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/components/cart/cart-provider";
import { openCartDrawer } from "@/components/cart/cart-drawer";
import { getLocalFavoris } from "@/lib/favoris-store";

export function FavorisView() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [ratings, setRatings] = useState<Record<number, RatingSummary>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      // Compte ? favoris serveur. Sinon, favoris locaux.
      const res = await fetch("/api/favoris").catch(() => null);
      let url = "/api/favoris";
      if (!res || !res.ok) {
        const ids = getLocalFavoris();
        if (ids.length === 0) {
          if (alive) setProducts([]);
          return;
        }
        url = `/api/favoris?ids=${ids.join(",")}`;
      }
      const data = await fetch(url)
        .then((r) => r.json())
        .catch(() => null);
      if (!alive) return;
      setProducts(data?.products ?? []);
      setRatings(data?.ratings ?? {});
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (products === null) {
    return <p className="animate-pulse py-10 text-cocoa/50">Chargement…</p>;
  }

  if (products.length === 0) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-deep text-cocoa/60">
          <HeartCrack className="h-7 w-7" />
        </span>
        <p className="mt-4 font-display text-2xl font-normal text-espresso">
          Aucun coup de cœur pour l'instant.
        </p>
        <p className="mt-1 text-sm font-light text-cocoa/65">
          Touche le cœur d'un produit pour le garder ici bien au chaud.
        </p>
        <Link href="/products" className="btn-coral mt-6">
          Explorer la boutique
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={() => {
            for (const p of products ?? []) {
              if (p.stock > 0) {
                addItem(
                  { productId: p.id, slug: p.slug, name: p.name, price: p.price, imageUrl: p.imageUrl, stock: p.stock },
                  1
                );
              }
            }
            openCartDrawer();
          }}
          className="btn-outline text-sm"
        >
          <ShoppingBag className="h-4 w-4" /> Tout ajouter au panier
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} rating={ratings[p.id]} />
        ))}
      </div>
    </>
  );
}
