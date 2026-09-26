import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MailCheck, MapPin, RotateCcw } from "lucide-react";
import { getStripe } from "@/lib/stripe";
import {
  confirmOrder,
  getOrderByStripeSession,
  type OrderWithItems,
} from "@/lib/orders";
import { formatPrice, formatDate } from "@/lib/format";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";

export const metadata: Metadata = {
  title: "Commande confirmée",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let paid = false;
  let order: OrderWithItems | null = null;

  if (session_id) {
    const stripe = getStripe();
    if (stripe) {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid") {
        await confirmOrder(session);
        order = await getOrderByStripeSession(session.id, true);
        paid = true;
      }
    } else if (session_id) {
      order = await getOrderByStripeSession(session_id, true);
      paid = order?.status === "paid";
    }
  }

  return (
    <div className="container-page py-16">
      <ClearCartOnMount />
      <style>{`
        .check-circle { stroke-dasharray: 183; stroke-dashoffset: 183; animation: draw-stroke 0.9s ease-out forwards; }
        .check-mark { stroke-dasharray: 60; stroke-dashoffset: 60; animation: draw-stroke 0.5s ease-out 0.7s forwards; }
        .check-pop { animation: pop-in 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes draw-stroke { to { stroke-dashoffset: 0; } }
        @keyframes pop-in { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .check-circle, .check-mark, .check-pop { animation: none; stroke-dashoffset: 0; } }
      `}</style>
      <div className="mx-auto max-w-2xl text-center">
        <div className="check-pop mx-auto h-20 w-20">
          <svg viewBox="0 0 64 64" className="h-20 w-20" role="img" aria-label="Paiement réussi">
            <circle
              cx="32"
              cy="32"
              r="29"
              fill="none"
              stroke="#221610"
              strokeOpacity="0.2"
              strokeWidth="4"
              strokeLinecap="round"
              className="check-circle"
            />
            <path
              d="M20 33.5 28.5 42 45 24"
              fill="none"
              stroke="#221610"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="check-mark"
            />
          </svg>
        </div>

        {paid && order ? (
          <>
            <p className="kicker mt-6 justify-center text-espresso">
              <MailCheck className="h-3.5 w-3.5" /> C’est payé
            </p>
            <h1 className="mt-2 font-display text-4xl font-light tracking-tight text-espresso">
              Ta commande est confirmée
            </h1>
            <p className="mt-3 text-cocoa/70">
              Confirmation envoyée à{" "}
              <span className="font-semibold text-espresso">{order.customerEmail}</span>.
              Si tu ne vois rien, vérifie tes spams.
            </p>

            <div className="card mt-8 overflow-hidden text-left">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-espresso/10 bg-cream/60 px-6 py-4">
                <p className="font-display font-normal text-espresso">
                  Commande n° {order.id}
                </p>
                <div className="flex items-center gap-2">
                  <span className="badge-green">Payée</span>
                  <p className="text-sm text-cocoa/60">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              <ul className="divide-y divide-espresso/10 px-6 text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4 py-3.5">
                    <span>
                      <span className="font-medium text-espresso">{item.productName}</span>{" "}
                      <span className="text-cocoa/60">
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="font-sans font-bold text-espresso">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-espresso/10 bg-cream/60 px-6 py-4 font-sans text-lg font-bold text-espresso">
                <span>Total payé</span>
                <span>{formatPrice(order.amountTotal)}</span>
              </div>
            </div>

            <p className="mx-auto mt-6 flex max-w-lg items-start justify-center gap-1.5 text-sm text-cocoa/70">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Livraison à : {order.addressLine1},{" "}
                {order.addressPostalCode} {order.addressCity},{" "}
                {order.addressCountry}
              </span>
            </p>
          </>
        ) : paid ? (
          <>
            <p className="kicker mt-6 justify-center text-espresso">Paiement reçu</p>
            <h1 className="mt-2 font-display text-4xl font-light tracking-tight text-espresso">
              Paiement reçu
            </h1>
            <p className="mt-2 text-cocoa/70">
              Ta commande est bien enregistrée. Le détail arrive par e-mail.
            </p>
          </>
        ) : (
          <>
            <p className="kicker mt-6 justify-center text-coral">Non confirmé</p>
            <h1 className="mt-2 font-display text-4xl font-light tracking-tight text-espresso">
              Paiement non confirmé
            </h1>
            <p className="mx-auto mt-2 max-w-md text-cocoa/70">
              {session_id
                ? "Pas encore confirmé. Vérifie ton paiement ou réessaie. On ne débite rien dans le doute."
                : "Aucune session de paiement. Repars de ton panier."}
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="btn-primary">
            Continuer à fouiller <ArrowRight className="h-4 w-4" />
          </Link>
          {!paid && (
            <Link href="/cart" className="btn-outline">
              <RotateCcw className="h-4 w-4" /> Retour au panier
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
