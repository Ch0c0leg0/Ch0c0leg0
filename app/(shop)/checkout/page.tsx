import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  CreditCard,
  Lock,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { SplitTitle } from "@/components/motion/split-title";

export const metadata: Metadata = {
  title: "Finaliser la commande",
};

const steps = [
  { label: "Panier", href: "/cart", icon: ShoppingBag, state: "done" as const },
  { label: "Infos", href: null, icon: UserRound, state: "current" as const },
  { label: "Paiement", href: null, icon: CreditCard, state: "next" as const },
];

export default function CheckoutPage() {
  return (
    <div className="container-page py-10">
      <p className="kicker text-coral">
        <Lock className="h-3.5 w-3.5" /> Commande sécurisée
      </p>
      <SplitTitle
        text="Finalise ta commande"
        as="h1"
        immediate
        accentWords={["commande"]}
        className="mt-2 font-display text-4xl font-normal tracking-tight text-espresso sm:text-5xl"
      />

      <ol className="mt-6 flex flex-wrap items-center gap-2">
        {steps.map((step, i) => (
          <li key={step.label} className="flex items-center gap-2">
            {i > 0 && (
              <ChevronRight
                className="h-4 w-4 text-espresso/30"
                aria-hidden
              />
            )}
            {step.href ? (
              <Link
                href={step.href}
                className="inline-flex items-center gap-2 rounded-full bg-espresso px-4 py-2 text-sm font-semibold text-cream shadow-warm transition-all hover:-translate-y-0.5"
              >
                <step.icon className="h-4 w-4" /> {step.label}
              </Link>
            ) : (
              <span
                aria-current={step.state === "current" ? "step" : undefined}
                className={
                  step.state === "current"
                    ? "inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white shadow-warm"
                    : "inline-flex items-center gap-2 rounded-full border border-espresso/10 bg-white px-4 py-2 text-sm font-semibold text-cocoa/60"
                }
              >
                <step.icon className="h-4 w-4" /> {step.label}
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
