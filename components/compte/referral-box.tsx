"use client";

import { useEffect, useState } from "react";
import { Gift, Copy, Check } from "lucide-react";

/** Bloc parrainage replié (details) — discret, page compte uniquement. */
export function ReferralBox() {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/parrainage")
      .then((r) => r.json())
      .then((d) => {
        if (d.code) setCode(String(d.code));
      })
      .catch(() => {});
  }, []);

  if (!code) return null;
  const link = `${window.location.origin}/inscription?ref=${encodeURIComponent(code)}`;

  return (
    <details className="rounded-2xl border border-espresso/10 bg-cream/60 px-4 py-3">
      <summary className="cursor-pointer text-sm font-semibold text-espresso">
        <Gift className="mr-1.5 inline h-4 w-4" />
        Parrainage : −10 % pour toi et tes proches
      </summary>
      <p className="mt-2 text-xs leading-relaxed text-cocoa/70">
        Partage ce lien. Quand ton proche commande, vous recevez chacun un code −10 %.
      </p>
      <div className="mt-2 flex gap-2">
        <input readOnly value={link} className="input flex-1 py-2 font-mono text-xs" onFocus={(e) => e.target.select()} />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(link).catch(() => {});
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
          className="btn-outline shrink-0 text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copié
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copier
            </>
          )}
        </button>
      </div>
    </details>
  );
}
