"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  CreditCard,
  Loader2,
  PackageSearch,
  Truck,
} from "lucide-react";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/format";

type TrackedItem = { productName: string; unitPrice: number; quantity: number };
type TrackedOrder = {
  id: number;
  status: string;
  customerName: string;
  addressLine1: string;
  addressCity: string;
  addressPostalCode: string;
  addressCountry: string;
  amountTotal: number;
  promoCode: string | null;
  discountAmount: number;
  createdAt: number;
  items: TrackedItem[];
};

const STEPS = [
  { key: "pending", label: "Reçue", Icon: PackageSearch },
  { key: "paid", label: "Payée", Icon: CreditCard },
  { key: "shipped", label: "Expédiée", Icon: Truck },
  { key: "done", label: "Livrée", Icon: Check },
];

function stepIndex(status: string): number {
  if (status === "pending") return 0;
  if (status === "paid") return 1;
  if (status === "shipped") return 2;
  return -1; // cancelled / refunded : timeline non applicable
}

export function SuiviForm() {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setOrder(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/suivi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: String(form.get("orderId") ?? "").replace("#", "").trim(),
          email: String(form.get("email") ?? ""),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Recherche impossible.");
        return;
      }
      setOrder(data.order);
      setStatus("idle");
    } catch {
      setStatus("error");
      setError("Impossible de contacter le serveur.");
    }
  }

  const current = order ? stepIndex(order.status) : -2;

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit} className="card grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto] sm:p-8">
        <div>
          <label className="label" htmlFor="orderId">
            N° de commande
          </label>
          <input
            id="orderId"
            name="orderId"
            required
            inputMode="numeric"
            className="input"
            placeholder="Ex : 42"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            E-mail de commande
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            placeholder="toi@exemple.fr"
          />
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={status === "loading"} className="btn-primary w-full sm:w-auto">
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Suivre"
            )}
          </button>
        </div>
      </form>

      {status === "error" && (
        <p className="mt-4 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-medium text-[#b23a20]">
          {error}
        </p>
      )}

      {order && (
        <div className="card mt-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-espresso/10 p-6">
            <div>
              <p className="font-display text-2xl font-normal text-espresso">
                Commande n° {order.id}
              </p>
              <p className="mt-0.5 text-sm font-light text-cocoa/60">
                {order.customerName} · {formatDate(order.createdAt)}
              </p>
            </div>
            <span className="badge-stone">
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>

          {current >= 0 ? (
            <ol className="flex items-center gap-1 p-6">
              {STEPS.map(({ key, label, Icon }, i) => (
                <li key={key} className="flex flex-1 items-center gap-2 last:flex-none">
                  <span className="flex flex-col items-center gap-1.5">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        i <= current
                          ? "bg-espresso text-cream"
                          : "bg-cream-deep text-cocoa/40"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span
                      className={`text-[11px] font-medium ${
                        i <= current ? "text-espresso" : "text-cocoa/40"
                      }`}
                    >
                      {label}
                    </span>
                  </span>
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className={`mb-6 h-0.5 flex-1 rounded-full ${
                        i < current ? "bg-espresso" : "bg-espresso/10"
                      }`}
                    />
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="p-6 text-sm font-light text-cocoa/70">
              Cette commande est {ORDER_STATUS_LABELS[order.status] ?? order.status}.
              Écris-nous via la page Contact si besoin.
            </p>
          )}

          <ul className="divide-y divide-espresso/8 border-t border-espresso/10">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
                <span>
                  <span className="font-medium text-espresso">{item.productName}</span>{" "}
                  <span className="text-cocoa/55">× {item.quantity}</span>
                </span>
                <span className="font-sans font-bold text-espresso">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between bg-cream/60 px-6 py-4">
            <span className="text-sm text-cocoa/70">
              {order.addressLine1}, {order.addressPostalCode} {order.addressCity}
            </span>
            <span className="font-sans text-lg font-bold text-espresso">
              {formatPrice(order.amountTotal)}
            </span>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm font-light text-cocoa/60">
        Un compte ?{" "}
        <Link href="/compte/commandes" className="font-normal underline underline-offset-4 hover:text-coral">
          Retrouve tout dans Mes commandes
        </Link>
      </p>
    </div>
  );
}
