import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  User,
  Truck,
  ShoppingBag,
  Clock,
  CreditCard,
  PackageCheck,
  Save,
  FileText,
  Undo2,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapOrder } from "@/lib/supabase/mappers";
import type { OrderItemRow, OrderRow } from "@/lib/supabase/types";
import { refundOrderAction, updateOrderStatusAction } from "@/app/admin/actions";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/format";

export const dynamic = "force-dynamic";

const TIMELINE_STEPS = [
  { key: "pending", label: "En attente", Icon: Clock },
  { key: "paid", label: "Payée", Icon: CreditCard },
  { key: "processing", label: "Préparation", Icon: ShoppingBag },
  { key: "shipped", label: "Expédiée", Icon: Truck },
  { key: "delivered", label: "Livrée", Icon: PackageCheck },
] as const;

function timelineIndex(status: string): number {
  const order = ["pending", "paid", "processing", "shipped", "delivered"];
  return order.indexOf(status);
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: orderData } = await admin
    .from("orders")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();
  if (!orderData) notFound();
  const orderRow = orderData as unknown as OrderRow;

  const { data: itemRows } = await admin
    .from("order_items")
    .select("*")
    .eq("order_id", orderRow.id);
  const items = Array.isArray(itemRows)
    ? (itemRows as unknown as OrderItemRow[])
    : [];
  const order = mapOrder(orderRow, items);
  const currentStep = timelineIndex(order.status);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center gap-1.5 text-sm text-cocoa/50"
        >
          <Link href="/admin/orders" className="font-medium hover:text-espresso">
            Commandes
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden />
          <span className="font-semibold text-espresso">#{order.id}</span>
        </nav>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-light tracking-tight">
            Commande n° {order.id}
          </h1>
          <ViewStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-cocoa/60">
          Passée le {formatDate(order.createdAt)}
        </p>
      </div>

      {/* Timeline du statut */}
      <div className="card p-5 sm:p-6">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-cocoa/60">
          Progression
        </h2>
        <ol className="mt-4 flex items-center gap-2">
          {TIMELINE_STEPS.map(({ key, label, Icon }, i) => {
            const done = currentStep >= 0 && i < currentStep;
            const current = currentStep >= 0 && i === currentStep;
            return (
              <li key={key} className="flex flex-1 items-center gap-2 last:flex-none">
                <span
                  className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 transition-colors ${
                    done
                      ? "bg-cream-deep text-espresso ring-espresso/15"
                      : current
                        ? "bg-coral text-cream ring-coral"
                        : "bg-cream-deep text-cocoa/40 ring-espresso/10"
                  }`}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={`hidden text-xs font-bold sm:block ${
                    current || done ? "text-espresso" : "text-cocoa/40"
                  }`}
                >
                  {label}
                </span>
                {i < TIMELINE_STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className={`mx-1 h-0.5 flex-1 rounded-full ${
                      currentStep > i ? "bg-espresso" : "bg-espresso/10"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
        {(order.status === "cancelled" || order.status === "refunded" || order.status === "returned") && (
          <p className="mt-3 text-xs font-semibold text-[#b23a20]">
            {ORDER_STATUS_LABELS[order.status]} — progression interrompue.
          </p>
        )}
        {(order.trackingNumber || order.carrier !== "domicile") && (
          <p className="mt-2 text-xs text-cocoa/60">
            Transport : {order.carrier || "domicile"}
            {order.trackingNumber ? ` · Suivi : ${order.trackingNumber}` : ""}
          </p>
        )}
      </div>

      {/* Infos client */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cocoa/60">
            <User className="h-4 w-4" /> Client
          </h2>
          <p className="mt-3 font-semibold text-espresso">{order.customerName}</p>
          <p className="text-sm text-cocoa/70">{order.customerEmail}</p>
          {order.promoCode && (
            <p className="mt-3 text-sm">
              <span className="badge badge-green font-mono">{order.promoCode}</span>{" "}
              <span className="text-cocoa/70">
                (−{formatPrice(order.discountAmount)})
              </span>
            </p>
          )}
        </div>
        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cocoa/60">
            <Truck className="h-4 w-4" /> Livraison
          </h2>
          {order.addressLine1 ? (
            <div className="mt-3 space-y-0.5 text-sm text-cocoa/80">
              <p>{order.addressLine1}</p>
              <p>
                {order.addressPostalCode} {order.addressCity}
              </p>
              <p>{order.addressCountry}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-cocoa/50">Non renseignée</p>
          )}
        </div>
      </div>

      {/* Articles */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-espresso/10 px-5 py-4">
          <ShoppingBag className="h-4 w-4 text-cocoa/60" />
          <h2 className="font-display text-lg font-normal">Articles</h2>
        </div>
        <ul className="divide-y divide-espresso/8">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <div>
                <p className="font-semibold text-espresso">{item.productName}</p>
                <p className="text-xs text-cocoa/50">
                  {formatPrice(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <p className="font-sans font-bold text-espresso">
                {formatPrice(item.unitPrice * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-espresso/10 bg-cream-deep/60 px-5 py-4 font-sans text-base font-bold text-espresso">
          <span className="flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-cocoa/60" /> Total
          </span>
          <span>{formatPrice(order.amountTotal)}</span>
        </div>
      </div>

      {/* Statut */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-normal">Statut de la commande</h2>
        <form action={updateOrderStatusAction} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={order.id} />
          <div>
            <label className="label" htmlFor="status">
              Modifier le statut
            </label>
            <select
              id="status"
              name="status"
              defaultValue={order.status}
              className="input"
            >
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="carrier">
              Transport
            </label>
            <select id="carrier" name="carrier" defaultValue={order.carrier || "domicile"} className="input">
              <option value="domicile">Domicile</option>
              <option value="relais">Point relais</option>
            </select>
          </div>
          <div className="min-w-48 flex-1">
            <label className="label" htmlFor="trackingNumber">
              N° de suivi (optionnel)
            </label>
            <input id="trackingNumber" name="trackingNumber" defaultValue={order.trackingNumber || ""} className="input font-mono" placeholder="1Z…" />
          </div>
          <button type="submit" className="btn-primary">
            <Save className="h-4 w-4" /> Enregistrer
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={`/api/orders/${order.id}/facture`} className="btn-outline text-sm">
            <FileText className="h-4 w-4" /> Facture PDF
          </a>
          {(order.status === "paid" || order.status === "shipped") && (
            <form action={refundOrderAction}>
              <input type="hidden" name="id" value={order.id} />
              <button type="submit" className="btn-ghost text-sm text-red-700">
                <Undo2 className="h-4 w-4" /> Rembourser (Stripe)
              </button>
            </form>
          )}
        </div>
        <p className="mt-4 text-xs text-cocoa/50">
          Commandée le {formatDate(order.createdAt)} · ID Stripe :{" "}
          <span className="font-mono">{order.stripeSessionId}</span>
        </p>
      </div>
    </div>
  );
}

function ViewStatusBadge({ status }: { status: string }) {
  const className =
    status === "paid" || status === "shipped" || status === "delivered" || status === "processing"
      ? "badge-green"
      : status === "pending"
        ? "badge-amber"
        : status === "cancelled" || status === "refunded" || status === "returned"
          ? "badge-red"
          : "badge-stone";
  return (
    <span className={`${className} text-sm`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
