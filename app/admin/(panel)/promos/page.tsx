import { Plus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapPromoCode } from "@/lib/supabase/mappers";
import type { PromoCodeRow } from "@/lib/supabase/types";
import { formatPrice, formatDate } from "@/lib/format";
import {
  createPromoAction,
  deletePromoAction,
  togglePromoAction,
} from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { RefreshButton } from "@/components/admin/refresh-button";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const { data, error } = await createAdminClient()
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });
  const promos =
    !error && Array.isArray(data)
      ? (data as unknown as PromoCodeRow[]).map(mapPromoCode)
      : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-honey">
            Marketing
          </p>
        <h1 className="font-display mt-1 text-3xl font-light tracking-tight">
          Codes promo
        </h1>
        <p className="mt-1 text-sm text-cocoa/60">
          Réductions appliquées au panier puis répercutées sur Stripe.
        </p>
        </div>
        <RefreshButton />
      </header>

      {/* Création */}
      <form action={createPromoAction} className="card p-5 sm:p-6">
        <h2 className="font-display text-lg font-normal text-espresso">
          Nouveau code
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="promo-code">Code *</label>
            <input id="promo-code" name="code" required className="input uppercase" placeholder="WELCOME10" />
          </div>
          <div>
            <label className="label" htmlFor="promo-type">Type</label>
            <select id="promo-type" name="type" className="input" defaultValue="percent">
              <option value="percent">Pourcentage (%)</option>
              <option value="amount">Montant (€)</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="promo-value">Valeur *</label>
            <input id="promo-value" name="value" required inputMode="decimal" className="input" placeholder="10 ou 5,00" />
          </div>
          <div>
            <label className="label" htmlFor="promo-min">Panier min. (€)</label>
            <input id="promo-min" name="minAmount" inputMode="decimal" className="input" placeholder="0" />
          </div>
          <div>
            <label className="label" htmlFor="promo-exp">Expiration</label>
            <input id="promo-exp" name="expiresAt" type="date" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="promo-limit">Limite d’usages</label>
            <input id="promo-limit" name="usageLimit" inputMode="numeric" className="input" placeholder="illimité" />
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-cream/60 px-4 py-3 ring-1 ring-espresso/10">
            <span className="text-sm font-semibold text-espresso">Actif</span>
            <span className="relative inline-flex shrink-0">
              <input type="checkbox" name="active" defaultChecked className="peer sr-only" />
              <span className="block h-6 w-11 rounded-full bg-espresso/15 transition-colors peer-checked:bg-espresso" />
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </span>
          </label>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full">
              <Plus className="h-4 w-4" /> Créer
            </button>
          </div>
        </div>
      </form>

      {/* Liste */}
      <div className="card overflow-hidden">
        {promos.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-cocoa/50">
            Aucun code promo. Crée WELCOME10 pour souhaiter la bienvenue.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso/10 bg-cream/50 text-left text-[11px] uppercase tracking-[0.14em] text-cocoa/60">
                  <th className="px-5 py-3 font-bold">Code</th>
                  <th className="px-5 py-3 font-bold">Réduction</th>
                  <th className="px-5 py-3 font-bold">Usages</th>
                  <th className="px-5 py-3 font-bold">Expiration</th>
                  <th className="px-5 py-3 font-bold text-center">Actif</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/8">
                {promos.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-cream/70">
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-xl bg-cream-deep px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-espresso ring-1 ring-espresso/10">
                        {p.code}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-espresso">
                      {p.type === "percent" ? `−${p.value} %` : `−${formatPrice(p.value)}`}
                      {p.minAmount > 0 && (
                        <span className="block text-xs font-normal text-cocoa/50">
                          dès {formatPrice(p.minAmount)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-cocoa/70">
                      {p.usedCount}{p.usageLimit !== null ? ` / ${p.usageLimit}` : ""}
                    </td>
                    <td className="px-5 py-3 text-cocoa/70">
                      {p.expiresAt ? formatDate(p.expiresAt) : "—"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <form action={togglePromoAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                            p.active ? "bg-espresso" : "bg-espresso/20"
                          }`}
                        >
                          <span
                            className={`h-5 w-5 rounded-full bg-white shadow ${
                              p.active ? "translate-x-5" : "translate-x-0"
                            } transition-transform`}
                          />
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DeleteButton
                        action={deletePromoAction}
                        id={p.id}
                        label="Supprimer"
                        confirmMessage={`Supprimer le code « ${p.code} » ?`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
