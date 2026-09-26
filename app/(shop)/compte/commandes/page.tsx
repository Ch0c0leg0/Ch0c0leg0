import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import { getUserOrders } from "@/lib/orders";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/format";
import { requireCustomer } from "@/lib/customer";

export const dynamic = "force-dynamic";

function statusBadgeClass(status: string) {
  if (status === "paid" || status === "shipped") return "badge-green";
  if (status === "pending") return "badge-amber";
  if (status === "cancelled" || status === "refunded") return "badge-red";
  return "badge-stone";
}

export default async function MesCommandesPage() {
  const user = await requireCustomer();
  const orders = await getUserOrders(user.id);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="kicker text-coral">Historique</p>
        <h1 className="mt-1 font-display text-3xl font-light tracking-tight text-espresso sm:text-4xl">
          Tes commandes
        </h1>
        <p className="mt-2 text-sm text-cocoa/70">
          {orders.length} commande(s). Les récentes d’abord.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-deep text-cocoa/60">
            <PackageOpen className="h-8 w-8" />
          </div>
          <p className="font-display text-xl font-normal text-espresso">
            Zéro commande.
          </p>
          <p className="text-sm text-cocoa/70">
            Ton historique est vide. Ton setup attend toujours.
          </p>
          <Link href="/products" className="btn-coral mt-2">
            Voir le matos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-warm">
              <Link
                href={`/compte/commandes/${o.id}`}
                className="flex items-center justify-between gap-4 p-5"
              >
                <div>
                  <p className="font-display font-normal text-espresso">Commande n° {o.id}</p>
                  <p className="mt-0.5 text-xs text-cocoa/60">
                    {formatDate(o.createdAt)} · {o.items.length} article(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-sans text-sm font-bold text-espresso">{formatPrice(o.amountTotal)}</span>
                  <span className={statusBadgeClass(o.status)}>
                    {ORDER_STATUS_LABELS[o.status] ?? o.status}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-deep text-cocoa">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
