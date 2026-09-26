"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";

/** Tiroir filtres (mobile uniquement, bouton masqué sur desktop). */
export function FiltersDrawer({
  children,
  count,
}: {
  children: React.ReactNode;
  count: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-outline relative"
      >
        <SlidersHorizontal className="h-4 w-4" /> Filtres
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-xs font-bold text-white">
            {count}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-night/50 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-label="Filtres"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-[85vw] max-w-sm overflow-y-auto rounded-l-[2rem] bg-cream p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="font-display text-xl font-normal text-espresso">
                  Filtres
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer les filtres"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-espresso transition-colors hover:bg-espresso/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
