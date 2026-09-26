"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

export function CartBadge() {
  const { count, hydrated } = useCart();
  return (
    <Link
      href="/cart"
      className="group relative inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2.5 text-sm font-medium text-cream transition-all duration-300 hover:-translate-y-0.5 hover:shadow-warm active:translate-y-0"
      aria-label="Voir le panier"
    >
      <ShoppingBag className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
      <span className="hidden sm:inline">Panier</span>
      {count > 0 && (
        <span
          key={count}
          className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-coral px-1 text-xs font-bold text-white"
        >
          {hydrated ? count : ""}
        </span>
      )}
    </Link>
  );
}
