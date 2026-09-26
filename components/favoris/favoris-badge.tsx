"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { FAVORIS_EVENT, getLocalFavoris } from "@/lib/favoris-store";

/** Pastille favoris du header (compte ou local invité). */
export function FavorisBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/favoris")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (alive && d) setCount((d.ids as number[]).length);
        })
        .catch(() => {
          if (alive) setCount(getLocalFavoris().length);
        });
    };
    load();
    const reload = () => {
      // Après un toggle local, recompte sans attendre le réseau.
      fetch("/api/favoris")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (alive && d) setCount((d.ids as number[]).length);
          else if (alive) setCount(getLocalFavoris().length);
        })
        .catch(() => {
          if (alive) setCount(getLocalFavoris().length);
        });
    };
    window.addEventListener(FAVORIS_EVENT, reload);
    return () => {
      alive = false;
      window.removeEventListener(FAVORIS_EVENT, reload);
    };
  }, []);

  return (
    <Link
      href="/favoris"
      aria-label="Mes favoris"
      className="group relative flex h-10 w-10 items-center justify-center rounded-full text-espresso transition-all duration-300 hover:bg-espresso hover:text-cream"
    >
      <Heart className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
      {count > 0 && (
        <span
          key={count}
          className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-coral px-1 text-xs font-bold text-white"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
