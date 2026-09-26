"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function ProductError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-xl p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-coral/10 text-[#b23a20]">
          <TriangleAlert className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-normal text-espresso">
          Oups, cette fiche a buggé.
        </h1>
        <p className="mt-2 text-sm font-light text-cocoa/70">
          Rien de grave — réessaie, ou reviens à la boutique.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-coral">
            Réessayer
          </button>
          <Link href="/products" className="btn-outline">
            Retour boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
