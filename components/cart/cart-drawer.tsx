"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/format";

export const CART_OPEN_EVENT = "cart:open";

/** Mini-panier discret : drawer latéral, fermé par défaut. */
export function CartDrawer() {
  const { items, total, count } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(CART_OPEN_EVENT, onOpen);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(CART_OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-night/40 backdrop-blur-[2px]"
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            role="dialog"
            aria-label="Mini-panier"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-cream shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-espresso/10 px-5 py-4">
              <p className="flex items-center gap-2 font-display text-lg text-espresso">
                <ShoppingBag className="h-5 w-5" /> Panier ({count})
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le panier"
                className="rounded-full p-2 text-espresso/60 hover:bg-espresso/5 hover:text-espresso"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="py-10 text-center text-sm text-cocoa/60">
                  Ton panier est vide.{" "}
                  <Link href="/products" onClick={() => setOpen(false)} className="underline underline-offset-4">
                    Voir le matos
                  </Link>
                </p>
              ) : (
                <ul className="space-y-4">
                  {items.slice(0, 5).map((i) => (
                    <li key={i.productId} className="flex gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                        <ProductImage src={i.imageUrl || "/placeholder.svg"} alt={i.name} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="truncate font-medium text-espresso">{i.name}</p>
                        <p className="text-cocoa/60">
                          {i.quantity} × {formatPrice(i.price)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-espresso">{formatPrice(i.price * i.quantity)}</p>
                    </li>
                  ))}
                </ul>
              )}
              {items.length > 5 && (
                <p className="mt-3 text-xs text-cocoa/55">+ {items.length - 5} autre(s) article(s) dans le panier.</p>
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-espresso/10 px-5 py-4">
                <div className="flex justify-between text-sm font-bold text-espresso">
                  <span>Sous-total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="mt-1 text-xs text-cocoa/55">Livraison calculée à l&apos;étape suivante.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link href="/cart" onClick={() => setOpen(false)} className="btn-outline text-center text-sm">
                    Voir panier
                  </Link>
                  <Link href="/checkout" onClick={() => setOpen(false)} className="btn-coral text-center text-sm">
                    Commander
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function openCartDrawer() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_OPEN_EVENT));
  }
}
