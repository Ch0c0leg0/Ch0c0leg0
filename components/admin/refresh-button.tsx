"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Rafraîchit les données de la page (re-render serveur)
 * sans recharger tout le document.
 */
export function RefreshButton({ className }: { className?: string }) {
  const router = useRouter();
  const [spinning, setSpinning] = useState(false);

  function handleClick() {
    if (spinning) return;
    setSpinning(true);
    router.refresh();
    // router.refresh() n'a pas de callback : on arrête l'animation
    // après un délai raisonnable (les données arrivent entre-temps).
    window.setTimeout(() => setSpinning(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Actualiser la liste"
      aria-label="Actualiser la liste"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-espresso/15 bg-white px-4 py-2.5 text-sm font-semibold text-cocoa transition-all duration-300 hover:-translate-y-0.5 hover:border-espresso hover:text-espresso active:translate-y-0 disabled:opacity-60",
        className
      )}
    >
      <RefreshCw
        className={cn("h-4 w-4", spinning && "animate-spin")}
      />
      <span className="hidden sm:inline">Actualiser</span>
    </button>
  );
}
