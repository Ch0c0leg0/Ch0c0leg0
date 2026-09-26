"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/supabase/types";

export function SearchExpand() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || q.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/suggestions?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json().catch(() => null);
        setResults(Array.isArray(data?.products) ? data.products : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => window.clearTimeout(t);
  }, [q, open]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={boxRef} className="relative hidden items-center lg:flex">
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div
            key="form"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <form action="/products" onSubmit={() => setOpen(false)} className="relative overflow-visible">
              <input
                name="q"
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Clavier, souris…"
                className="w-full rounded-full border border-espresso/15 bg-white py-2 pl-4 pr-9 text-sm placeholder:text-espresso/35 focus:border-honey focus:outline-none focus:ring-4 focus:ring-honey/20"
              />
              <button
                type="button"
                aria-label="Fermer la recherche"
                onClick={() => setOpen(false)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-espresso/40 transition-all duration-300 hover:rotate-90 hover:text-espresso"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
            {(loading || results.length > 0) && q.trim().length >= 2 && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-espresso/10 bg-white shadow-lift">
                {loading && results.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-cocoa/55">Recherche…</p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto py-1">
                    {results.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/products/${p.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-cream"
                        >
                          <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                            <ProductImage src={p.imageUrl || "/placeholder.svg"} alt={p.name} fill sizes="40px" className="object-cover" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-espresso">{p.name}</span>
                            <span className="text-xs font-bold text-cocoa/70">{formatPrice(p.price)}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                    <li className="border-t border-espresso/10">
                      <form action="/products" className="px-3 py-2">
                        <input type="hidden" name="q" value={q} />
                        <button type="submit" className="flex w-full items-center gap-2 text-sm font-semibold text-coral hover:text-espresso">
                          <Search className="h-4 w-4" /> Voir tous les résultats
                        </button>
                      </form>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="button"
            type="button"
            aria-label="Rechercher"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-full text-espresso transition-colors hover:bg-espresso/5"
          >
            <Search className="h-5 w-5 transition-transform duration-300 hover:-rotate-12" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
