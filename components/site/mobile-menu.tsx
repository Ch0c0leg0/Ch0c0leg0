"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/lib/supabase/types";
import { CategoryIcon } from "@/components/category-icon";

export function MobileMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full text-espresso transition-colors hover:bg-espresso/5"
      >
        <span className="relative block h-5 w-5">
          <Menu
            className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
              open ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
            }`}
          />
          <X
            className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
              open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
            }`}
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-3 top-[4.25rem] z-50 rounded-3xl border border-espresso/10 bg-cream p-3 shadow-lift"
          >
            {[
              { href: "/products", label: "Boutique" },
              { href: "/categories", label: "Catégories" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 font-display text-lg font-normal text-espresso transition-colors hover:bg-espresso/5"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-espresso/10" />
            {categories.slice(0, 7).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
              >
                <Link
                  href={`/categories/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-cocoa transition-colors hover:bg-espresso/5"
                >
                  <CategoryIcon name={c.icon} className="h-4 w-4 text-coral" />
                  {c.name}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
