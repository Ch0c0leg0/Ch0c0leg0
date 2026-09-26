"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

type Props = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  className?: string;
};

export function AddToCartButton({
  productId,
  slug,
  name,
  price,
  imageUrl,
  stock,
  className = "",
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (stock <= 0) {
    return (
      <button className={`inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-espresso/10 bg-cream-deep px-6 py-3 text-sm font-semibold text-cocoa/50 ${className}`} disabled>
        Épuisé
      </button>
    );
  }

  function handleAdd() {
    addItem({ productId, slug, name, price, imageUrl, stock }, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
    window.setTimeout(() => {
      window.dispatchEvent(new Event("cart:open"));
    }, 350);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={added ? `btn-primary w-full ${className}` : `btn-coral w-full ${className}`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> Ajouté
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> Ajouter au panier
        </>
      )}
    </button>
  );
}
