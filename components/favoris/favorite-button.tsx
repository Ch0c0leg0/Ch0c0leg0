"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  FAVORIS_EVENT,
  getLocalFavoris,
  toggleLocalFavoris,
} from "@/lib/favoris-store";

/** Cœur favori : compte connecté (API) ou invité (local). */
export function FavoriteButton({
  productId,
  className,
}: {
  productId: number;
  className?: string;
}) {
  const [faved, setFaved] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/favoris")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        setLoggedIn(true);
        setFaved((d.ids as number[]).includes(productId));
      })
      .catch(() => {
        if (alive) setFaved(getLocalFavoris().includes(productId));
      });
    const sync = () => {
      if (!loggedIn) setFaved(getLocalFavoris().includes(productId));
    };
    window.addEventListener(FAVORIS_EVENT, sync);
    return () => {
      alive = false;
      window.removeEventListener(FAVORIS_EVENT, sync);
    };
  }, [productId, loggedIn]);

  async function toggle() {
    if (loggedIn) {
      const res = await fetch("/api/favoris", {
        method: faved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setFaved(!faved);
        window.dispatchEvent(new CustomEvent(FAVORIS_EVENT));
      }
      return;
    }
    setFaved(toggleLocalFavoris(productId).includes(productId));
  }

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={faved ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={faved}
      whileTap={{ scale: 0.75 }}
      whileHover={{ scale: 1.15 }}
      transition={{ type: "spring", stiffness: 500, damping: 14 }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-colors duration-300",
        faved
          ? "border-coral bg-coral text-white shadow-warm"
          : "border-espresso/15 bg-cream/80 text-espresso hover:border-coral hover:text-coral",
        className
      )}
    >
      <motion.span
        key={String(faved)}
        initial={{ scale: 0.4 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 12 }}
        className="flex"
      >
        <Heart className={cn("h-[18px] w-[18px]", faved && "fill-current")} />
      </motion.span>
    </motion.button>
  );
}
