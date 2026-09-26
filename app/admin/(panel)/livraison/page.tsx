import Link from "next/link";
import { Plus, Pencil, Euro } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createShippingRateAction,
  deleteShippingRateAction,
  toggleShippingRateAction,
} from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { RefreshButton } from "@/components/admin/refresh-button";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

type Rate = {
  id: number;
  zone: string;
  label: string;
  price: number;
  min_amount: number;
  active: boolean;
};

export default async function AdminLivraisonPage() {
  let rates: Rate[] = [];
  let missingTable = false;
  try {
    const { data, error } = await createAdminClient()
      .from("shipping_rates")
      .select("*")
      .order("zone", { ascending: true })
      .order("price", { ascending: true });
    if (error) throw error;
    rates = (Array.isArray(data) ? data : []).map((r) => {
      const row = r as unknown as Record<string, unknown>;
      return {
        id: Number(row.id ?? 0),
        zone: String(row.zone ?? "FR"),
        label: String(row.label ?? ""),
        price: Number(row.price ?? 0),
        min_amount: Number(row.min_amount ?? 0),
        active: Boolean(row.active),
      } as Rate;
    });
  } catch {
    missingTable = true;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-honey">
            Logistique
          </p>
          <h1 className="font-display mt-1 text-3xl font-light tracking-tight">
            Livraison
          </h1>
          <p className="mt-1 text-sm text-cocoa/60">
            Tarifs appliqués au checkout en temps réel. Gardez un tarif à 0 €
            (domicile) et un tarif contenant « relais » dans son libellé.
          </p>
        </div>
        <RefreshButton />
      </header>

      {missingTable && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Table introuvable — exécutez <span className="font-mono">supabase/migration_all_lots.sql</span> dans
          le SQL Editor Supabase.
        </p>
      )}

      <form action={createShippingRateAction} className="card p-5 sm:p-6">
        <h2 className="font-display text-lg font-normal text-espresso">
          Nouveau tarif
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className="label" htmlFor="rate-label">
              Libellé *
            </label>
            <input id="rate-label" name="label" required className="input" placeholder="Ex : Point relais" />
          </div>
          <div>
            <label className="label" htmlFor="rate-zone">
              Zone
            </label>
            <select id="rate-zone" name="zone" className="input" defaultValue="FR">
              {["FR", "BE", "CH", "LU", "CA"].map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="rate-price">
              Prix (€)
            </label>
            <input id="rate-price" name="price" type="number" min={0} step="0.01" defaultValue="0" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="rate-min">
              Franco dès (€)
            </label>
            <input id="rate-min" name="minAmount" type="number" min={0} step="0.01" defaultValue="0" className="input" />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-espresso">
            <input type="checkbox" name="active" defaultChecked className="h-4 w-4 accent-[#ff6b4a]" />
            Actif
          </label>
        </div>
        <button type="submit" className="btn-primary mt-4">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </form>

      <div className="card overflow-hidden">
        {rates.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-cocoa/50">
            Aucun tarif. Le checkout utilise ses valeurs de secours en attendant.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso/10 bg-cream/50 text-left text-[11px] uppercase tracking-[0.14em] text-cocoa/60">
                  <th className="px-5 py-3 font-bold">Libellé</th>
                  <th className="px-5 py-3 font-bold">Zone</th>
                  <th className="px-5 py-3 font-bold text-right">Prix</th>
                  <th className="px-5 py-3 font-bold text-right">Franco dès</th>
                  <th className="px-5 py-3 font-bold text-center">Actif</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/8">
                {rates.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-cream/70">
                    <td className="px-5 py-3">
                      <p className="flex items-center gap-2 font-semibold text-espresso">
                        <Euro className="h-4 w-4 text-cocoa/50" /> {r.label}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="badge badge-stone">{r.zone}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-espresso">
                      {r.price === 0 ? "Offerte" : formatPrice(r.price)}
                    </td>
                    <td className="px-5 py-3 text-right text-cocoa/70">
                      {r.min_amount > 0 ? formatPrice(r.min_amount) : "—"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <form action={toggleShippingRateAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                            r.active ? "bg-espresso" : "bg-espresso/20"
                          }`}
                          title={r.active ? "Cliquer pour désactiver" : "Cliquer pour activer"}
                        >
                          <span
                            className={`h-5 w-5 rounded-full bg-white shadow ${
                              r.active ? "translate-x-5" : "translate-x-0"
                            } transition-transform`}
                          />
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/livraison/${r.id}/edit`} className="btn-ghost text-xs">
                          <Pencil className="h-3.5 w-3.5" /> Modifier
                        </Link>
                        <DeleteButton
                          action={deleteShippingRateAction}
                          id={r.id}
                          label="Supprimer"
                          confirmMessage={`Supprimer le tarif « ${r.label} » ?`}
                        />
                      </div>
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
