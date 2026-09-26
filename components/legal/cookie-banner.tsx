"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const KEY = "ch0c0leg0_cookies";

/** Bandeau RGPD : choix stocké en local, refus sans conséquence. */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(false);
    }
  }, []);

  function choose(value: "accepted" | "refused") {
    try {
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ value, at: Date.now() })
      );
    } catch {
      // Stockage indisponible : on masque quand même.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Choix des cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-[1.75rem] border border-espresso/10 bg-cream p-5 shadow-lift sm:inset-x-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
          <Cookie className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-normal text-espresso">
            On parle cookies ?
          </p>
          <p className="mt-1 text-sm font-light leading-relaxed text-cocoa/75">
            Juste le nécessaire : connexion, panier, ton choix ici.
            Zéro traceur pub, zéro revente.{" "}
            <Link href="/confidentialite" className="font-normal underline underline-offset-4 hover:text-coral">
              Détails
            </Link>{" "}
            ·{" "}
            <Link href="/cookies" className="font-normal underline underline-offset-4 hover:text-coral">
              Cookies
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="btn-primary flex-1 text-sm"
        >
          OK pour moi
        </button>
        <button
          type="button"
          onClick={() => choose("refused")}
          className="btn-outline flex-1 text-sm"
        >
          Non merci
        </button>
      </div>
    </div>
  );
}
