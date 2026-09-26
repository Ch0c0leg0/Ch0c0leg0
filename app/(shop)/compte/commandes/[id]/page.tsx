import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, MapPin } from "lucide-react";
import { getOrderById } from "@/lib/orders";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/format";
import { requireCustomer } from "@/lib/customer";

export const dynamic = "force-dynamic";

function statusBadgeClass(status: string) {
  if (status === "paid" || status === "shipped") return "badge-green";
  if (status === "pending") return "badge-amber";
  if (status === "cancelled" || status === "refunded") return "badge-red";
  return "badge-stone";
}

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCustomer();
  const order = await getOrderById(Number(id), true);
  if (!order || order.userId !== user.id) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-cocoa/60">
          <Link href="/compte/commandes" className="font-medium transition-colors hover:text-espresso">
            Tes commandes
          </Link>{" "}
          <span className="text-espresso/30">/ #{order.id}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-light tracking-tight text-espresso">
            Commande n° {order.id}
          </h1>
          <span className={statusBadgeClass(order.status)}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
          {(order.status === "paid" || order.status === "shipped" || order.status === "delivered" || order.status === "processing") && (
            <a href={`/api/orders/${order.id}/facture`} className="btn-ghost text-xs">
              <FileText className="h-4 w-4" /> Facture PDF
            </a>
          )}
        </div>
        <p className="mt-1.5 text-sm text-cocoa/60">{formatDate(order.createdAt)}</p>
      </div>

      <div className="card overflow-hidden">
        <ul className="divide-y divide-espresso/10">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
              <div>
                <p className="font-medium text-espresso">{item.productName}</p>
                <p className="text-xs text-cocoa/60">
                  {formatPrice(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <p className="font-sans font-bold text-espresso">
                {formatPrice(item.unitPrice * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        {order.discountAmount > 0 && (
          <div className="flex justify-between border-t border-espresso/10 bg-cream-deep px-5 py-3 text-sm font-sans font-bold text-espresso">
            <span>
              Code {order.promoCode}
            </span>
            <span>−{formatPrice(order.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-espresso/10 bg-cream/70 px-5 py-4 font-sans text-lg font-bold text-espresso">
          <span>Total</span>
          <span>{formatPrice(order.amountTotal)}</span>
        </div>
      </div>

      <div className="card flex gap-3 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-cocoa">
          <MapPin className="h-5 w-5" />
        </span>
        <div className="text-sm">
          <p className="font-display font-normal text-espresso">Livraison</p>
          <p className="mt-1 text-cocoa/70">
            {order.customerName} — {order.addressLine1},{" "}
            {order.addressPostalCode} {order.addressCity} ({order.addressCountry})
          </p>
        </div>
      </div>

      <Link href="/compte/commandes" className="btn-outline">
        <ArrowLeft className="h-4 w-4" /> Retour aux commandes
      </Link>
    </div>
  );
}
