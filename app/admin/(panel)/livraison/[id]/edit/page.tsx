import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Save } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateShippingRateAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminEditShippingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await createAdminClient()
    .from("shipping_rates")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();
  if (!data) notFound();
  const row = data as unknown as Record<string, unknown>;
  const rate = {
    id: Number(row.id ?? 0),
    zone: String(row.zone ?? "FR"),
    label: String(row.label ?? ""),
    price: Number(row.price ?? 0) / 100,
    minAmount: Number(row.min_amount ?? 0) / 100,
    active: Boolean(row.active),
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <nav
          aria-label="Fil d'Ariane"
          className="flex flex-wrap items-center gap-1.5 text-sm text-cocoa/50"
        >
          <Link href="/admin/livraison" className="font-medium hover:text-espresso">
            Livraison
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden />
          <span className="font-semibold text-espresso">{rate.label}</span>
        </nav>
        <h1 className="font-display mt-2 text-3xl font-light tracking-tight">
          Modifier le tarif
        </h1>
      </div>

      <form action={updateShippingRateAction} className="card space-y-4 p-6">
        <input type="hidden" name="id" value={rate.id} />
        <div>
          <label className="label" htmlFor="label">
            Libellé *
          </label>
          <input id="label" name="label" required defaultValue={rate.label} className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="zone">
              Zone
            </label>
            <select id="zone" name="zone" defaultValue={rate.zone} className="input">
              {["FR", "BE", "CH", "LU", "CA"].map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="price">
              Prix (€)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={rate.price.toFixed(2)}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="minAmount">
              Franco dès (€)
            </label>
            <input
              id="minAmount"
              name="minAmount"
              type="number"
              min={0}
              step="0.01"
              defaultValue={rate.minAmount.toFixed(2)}
              className="input"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-espresso">
          <input type="checkbox" name="active" defaultChecked={rate.active} className="h-4 w-4 accent-[#ff6b4a]" />
          Tarif actif
        </label>
        <button type="submit" className="btn-primary">
          <Save className="h-4 w-4" /> Enregistrer
        </button>
      </form>
    </div>
  );
}
