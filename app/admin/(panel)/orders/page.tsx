import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapOrder } from "@/lib/supabase/mappers";
import type { OrderRow } from "@/lib/supabase/types";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/format";
import { RefreshButton } from "@/components/admin/refresh-button";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const statusFilter = (sp.status ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const perPage = 20;
  const admin = createAdminClient();
  let query = admin.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (statusFilter) query = query.eq("status", statusFilter);
  const [{ data: rows }, { count: total }] = await Promise.all([
    query,
    admin.from("orders").select("*", { count: "exact", head: true }),
  ]);
  const all = Array.isArray(rows)
    ? (rows as unknown as OrderRow[]).map((r) => mapOrder(r, []))
    : [];
  const filtered = q
    ? all.filter(
        (o) =>
          String(o.id).includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      )
    : all;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const list = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-honey">
            Ventes
          </p>
          <h1 className="font-display mt-1 text-3xl font-light tracking-tight">
            Commandes
          </h1>
        <p className="mt-1 text-sm text-cocoa/60">
          {total ?? 0} commande(s) au total — affichage des 100 dernières.
        </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action="/admin/orders" className="flex gap-2">
            <input name="q" defaultValue={q} placeholder="N°, client, e-mail…" className="input w-52 py-2 text-sm" />
            <select name="status" defaultValue={statusFilter} className="input w-40 py-2 text-sm">
              <option value="">Tous statuts</option>
              {Object.entries(ORDER_STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-outline text-sm">
              Filtrer
            </button>
          </form>
          <RefreshButton />
        </div>
      </header>
      {totalPages > 1 && (
        <p className="text-sm text-cocoa/60">
          Page {safePage}/{totalPages} — {filtered.length} résultat(s)
        </p>
      )}

      <div className="card overflow-hidden">
        {list.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-cocoa/50">
            Aucune commande pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso/10 bg-cream/50 text-left text-[11px] uppercase tracking-[0.14em] text-cocoa/60">
                  <th className="px-5 py-3 font-bold">N°</th>
                  <th className="px-5 py-3 font-bold">Client</th>
                  <th className="px-5 py-3 font-bold">Date</th>
                  <th className="px-5 py-3 font-bold text-right">Total</th>
                  <th className="px-5 py-3 font-bold">Statut</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/8">
                {list.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-cream/70">
                    <td className="px-5 py-3 font-bold text-espresso">#{o.id}</td>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-espresso">{o.customerName}</p>
                      <p className="text-xs text-cocoa/50">
                        {o.customerEmail}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-cocoa/70">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-espresso">
                      {formatPrice(o.amountTotal)}
                    </td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="btn-ghost text-xs"
                      >
                        Détails
                      </Link>
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

function OrderStatusBadge({ status }: { status: string }) {
  const className =
    status === "paid" || status === "shipped" || status === "delivered" || status === "processing"
      ? "badge-green"
      : status === "pending"
        ? "badge-amber"
        : status === "cancelled" || status === "refunded" || status === "returned"
          ? "badge-red"
          : "badge-stone";
  return <span className={className}>{ORDER_STATUS_LABELS[status] ?? status}</span>;
}
