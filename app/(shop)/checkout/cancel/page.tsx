import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, RotateCcw, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Commande annulée",
};

export default function CheckoutCancelPage() {
  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-xl p-8 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-coral/10 text-coral">
          <XCircle className="h-8 w-8" />
        </div>
        <p className="kicker mt-6 justify-center text-coral">
          Transaction stoppée
        </p>
        <h1 className="mt-2 font-display text-3xl font-light tracking-tight text-espresso sm:text-4xl">
          C’est annulé
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-cocoa/70">
          Tu n’as rien payé. Ton panier t’attend. Il patiente mieux que toi.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/cart" className="btn-primary">
            <RotateCcw className="h-4 w-4" /> Retour au panier
          </Link>
          <Link href="/products" className="btn-outline">
            Voir le matos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
