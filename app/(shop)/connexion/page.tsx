import type { Metadata } from "next";
import { LoginForm } from "@/components/compte/login-form";
import { SplitTitle } from "@/components/motion/split-title";
import { GsapReveal } from "@/components/motion/gsap-reveal";

export const metadata: Metadata = { title: "Connexion" };

export default function ConnexionPage() {
  return (
    <div className="relative overflow-hidden bg-cream-deep">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-coral/10 blur-3xl" />
      </div>
      <div className="container-page relative max-w-md py-14 sm:py-20">
        <p className="kicker justify-center text-coral">Ton espace</p>
        <SplitTitle
          text="Bon retour"
          as="h1"
          immediate
          accentWords={["retour"]}
          className="mt-2 text-center font-display text-4xl font-light tracking-tight text-espresso sm:text-5xl"
        />
        <p className="mb-8 mt-3 text-center text-sm text-cocoa/70">
          Reconnecte-toi. Tes commandes t’attendent. Ton panier aussi.
        </p>
        <GsapReveal delay={0.1}>
          <LoginForm />
        </GsapReveal>
      </div>
    </div>
  );
}
