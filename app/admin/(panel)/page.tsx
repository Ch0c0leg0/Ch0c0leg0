import Link from "next/link";
import {
  ArrowRight,
  Plus,
  Banknote,
  ShoppingBag,
  Package,
  TriangleAlert,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapOrder, mapProduct } from "@/lib/supabase/mappers";
import type { OrderRow, ProductRow } from "@/lib/supabase/types";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/format";
import { RefreshButton } from "@/components/admin/refresh-button";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const [{ data: paidRows }, { count: totalOrders }, { count: pendingOrders }, { count: activeProducts }, { data: activeList }, { data: recentRows }] =
    await Promise.all([
      admin.from("orders").select("amount_total").eq("status", "paid"),
      admin.from("orders").select("*", { count: "exact", head: true }),
      admin.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      admin.from("products").select("*", { count: "exact", head: true }).eq("active", true),
      admin.from("products").select("*").eq("active", true),
      admin.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
    ]);

  // CA 30 jours + panier moyen + top produits (tolérant, discret).
  let revenue30 = 0;
  let daily: { label: string; total: number }[] = [];
  let avgBasket = 0;
  let topProducts: { name: string; qty: number; revenue: number }[] = [];
  try {
    const since = Date.now() - 30 * 24 * 3600 * 1000;
    const { data: lastOrders } = await admin
      .from("orders")
      .select("amount_total,created_at")
      .in("status", ["paid", "shipped", "delivered", "processing"])
      .gte("created_at", since)
      .limit(500);
    const rows = Array.isArray(lastOrders) ? (lastOrders as unknown as { amount_total: unknown; created_at: unknown }[]) : [];
    revenue30 = rows.reduce((s, o) => s + Number(o.amount_total ?? 0), 0);
    avgBasket = rows.length ? Math.round(revenue30 / rows.length) : 0;
    const byDay = new Map<string, number>();
    for (const o of rows) {
      const d = new Date(Number(o.created_at ?? Date.now()));
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      byDay.set(key, (byDay.get(key) ?? 0) + Number(o.amount_total ?? 0));
    }
    daily = [...byDay.entries()].slice(-14).map(([label, total]) => ({ label, total }));
    const { data: topItems } = await admin.from("order_items").select("product_name,quantity,unit_price").limit(500);
    if (Array.isArray(topItems)) {
      const acc = new Map<string, { qty: number; revenue: number }>();
      for (const it of topItems as unknown as { product_name: unknown; quantity: unknown; unit_price: unknown }[]) {
        const name = String(it.product_name ?? "—");
        const cur = acc.get(name) ?? { qty: 0, revenue: 0 };
        cur.qty += Number(it.quantity ?? 0);
        cur.revenue += Number(it.quantity ?? 0) * Number(it.unit_price ?? 0);
        acc.set(name, cur);
      }
      topProducts = [...acc.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    }
  } catch {
    // Dashboard de base reste affiché.
  }

  const revenue = Array.isArray(paidRows)
    ? (paidRows as unknown as { amount_total: number }[]).reduce(
        (s, o) => s + Number(o.amount_total ?? 0),
        0
      )
    : 0;
  const paidCount = Array.isArray(paidRows) ? paidRows.length : 0;

  const lowStock = Array.isArray(activeList)
    ? (activeList as unknown as ProductRow[]).map(mapProduct).filter((p) => p.stock <= 5)
    : [];
  const recentOrders = Array.isArray(recentRows)
    ? (recentRows as unknown as OrderRow[]).map((r) => mapOrder(r, []))
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-honey">
            Ch0c0leg0 · Administration
          </p>
          <h1 className="font-display mt-2 text-3xl font-light tracking-tight">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-cocoa/60">
            Vue d’ensemble de votre boutique.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <Link href="/admin/products/new" className="btn-coral">
            <Plus className="h-4 w-4" /> Nouveau produit
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Chiffre d'affaires (payé)"
          value={formatPrice(revenue)}
          hint={`${paidCount} commande(s) payée(s)`}
          icon={<Banknote className="h-5 w-5" />}
          tone="bg-cream-deep text-espresso"
        />
        <StatCard
          label="Commandes totales"
          value={String(totalOrders ?? 0)}
          hint={`${pendingOrders ?? 0} en attente de paiement`}
          icon={<ShoppingBag className="h-5 w-5" />}
          tone="bg-cream-deep text-espresso"
        />
        <StatCard
          label="Produits actifs"
          value={String(activeProducts ?? 0)}
          hint={`${lowStock.length} en stock faible`}
          icon={<Package className="h-5 w-5" />}
          tone="bg-cream-deep text-espresso"
        />
        <StatCard
          label="Articles en stock faible"
          value={String(lowStock.length)}
          hint={lowStock.length > 0 ? "Pensez à réapprovisionner" : "Tout va bien"}
          icon={<TriangleAlert className="h-5 w-5" />}
          tone="bg-cream-deep text-espresso"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CA 30j discret (barres CSS, sans lib) */}
        <section className="card overflow-hidden">
          <div className="border-b border-espresso/10 px-5 py-4">
            <h2 className="font-display text-lg font-normal">CA 30 derniers jours</h2>
            <p className="text-xs text-cocoa/55">
              {formatPrice(revenue30)} · Panier moyen {formatPrice(avgBasket)}
            </p>
          </div>
          {daily.length === 0 ? (
            <p className="px-5 py-8 text-sm text-cocoa/50">Pas encore de données.</p>
          ) : (
            <div className="flex h-32 items-end gap-1.5 px-5 py-4">
              {daily.map((d) => {
                const max = Math.max(...daily.map((x) => x.total), 1);
                return (
                  <div key={d.label} title={`${d.label} : ${formatPrice(d.total)}`} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-lg bg-espresso/80"
                      style={{ height: `${Math.max(4, Math.round((d.total / max) * 96))}px` }}
                    />
                    <span className="text-[10px] text-cocoa/50">{d.label}</span>
                  </div>
                );
              })}
            </div>
          )}
          {topProducts.length > 0 && (
            <ul className="divide-y divide-espresso/8 border-t border-espresso/10">
              {topProducts.map((t) => (
                <li key={t.name} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                  <span className="truncate font-medium text-espresso">{t.name}</span>
                  <span className="shrink-0 text-xs text-cocoa/60">
                    {t.qty} vendu(s) · {formatPrice(t.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        {/* Dernières commandes */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-espresso/10 px-5 py-4">
            <h2 className="font-display text-lg font-normal">Dernières commandes</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa/70 hover:text-espresso"
            >
              Tout voir <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-sm text-cocoa/50">
              Aucune commande pour le moment.
            </p>
          ) : (
            <ul className="divide-y divide-espresso/8">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-cream/70"
                  >
                    <div>
                      <p className="text-sm font-semibold text-espresso">
                        #{o.id} — {o.customerName}
                      </p>
                      <p className="text-xs text-cocoa/50">
                        {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-sm font-bold text-espresso">
                        {formatPrice(o.amountTotal)}
                      </span>
                      <StatusBadge status={o.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Stock faible */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-espresso/10 px-5 py-4">
            <h2 className="font-display text-lg font-normal">Stock faible</h2>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa/70 hover:text-espresso"
            >
              Gérer les produits <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-8 text-sm text-cocoa/50">
              Aucun produit en stock faible.
            </p>
          ) : (
            <ul className="divide-y divide-espresso/8">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-cream/70"
                  >
                    <div>
                      <p className="text-sm font-semibold text-espresso">{p.name}</p>
                      <p className="text-xs text-cocoa/50">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                    <span
                      className={`badge ${
                        p.stock === 0
                          ? "badge-red"
                          : p.stock <= 3
                            ? "badge-amber"
                            : "badge-stone"
                      }`}
                    >
                      {p.stock === 0 ? "Épuisé" : `${p.stock} restant(s)`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="card bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cocoa/60">
          {label}
        </p>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${tone}`}>
          {icon}
        </span>
      </div>
      <p className="font-display mt-2 text-3xl font-normal tracking-tight text-espresso">
        {value}
      </p>
      <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-cocoa/60">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-honey" />
        {hint}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "paid"
      ? "badge-green"
      : status === "pending"
        ? "badge-amber"
        : status === "cancelled" || status === "refunded"
          ? "badge-red"
          : "badge-stone";
  return (
    <span className={className}>{ORDER_STATUS_LABELS[status] ?? status}</span>
  );
}
