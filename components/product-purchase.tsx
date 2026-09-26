"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

type Props = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
};

export function ProductPurchase(product: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(
      {
        productId: product.productId,
        slug: product.slug,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
      },
      qty
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
    window.setTimeout(() => {
      window.dispatchEvent(new Event("cart:open"));
    }, 450);
  }

  if (product.stock <= 0) {
    return (
      <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-semibold text-[#b23a20]">
        Article épuisé — reviens vite, il est souvent restocké.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="badge-green">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          En stock ({product.stock} disponible{product.stock > 1 ? "s" : ""})
        </span>
        {product.stock <= 5 && (
          <span className="badge-amber">Stock limité</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-2xl border border-espresso/15 bg-white">
          <button
            type="button"
            aria-label="Diminuer la quantité"
            onClick={() => setQty((v) => Math.max(1, v - 1))}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-cocoa transition-all duration-300 hover:bg-espresso/5 hover:text-espresso active:scale-90"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-sans text-base font-bold">{qty}</span>
          <button
            type="button"
            aria-label="Augmenter la quantité"
            onClick={() => setQty((v) => Math.min(product.stock, v + 1))}
            className="flex h-12 w-12 items-center justify-center rounded-xl text-cocoa transition-all duration-300 hover:bg-espresso/5 hover:text-espresso active:scale-90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className={cn("flex-1 py-3.5 text-base", added ? "btn-cream border border-espresso/20" : "btn-coral")}
        >
          {added ? (
            <>
              <Check className="h-5 w-5 animate-pop" /> Ajouté au panier
            </>
          ) : (
            <>
              <ShoppingBag className="h-5 w-5" /> Ajouter — {formatPrice(product.price * qty)}
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-cocoa/55">
        Paiement sécurisé Stripe · Livraison offerte · Satisfait ou remboursé
      </p>
    </div>
  );
}
