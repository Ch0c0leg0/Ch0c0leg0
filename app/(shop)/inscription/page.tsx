import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/customer";
import { SignupForm } from "@/components/compte/signup-form";
import { SplitTitle } from "@/components/motion/split-title";
import { GsapReveal } from "@/components/motion/gsap-reveal";

export const metadata: Metadata = { title: "Créer un compte" };

export default async function InscriptionPage() {
  if (await getCurrentUser()) redirect("/compte");
  return (
    <div className="relative overflow-hidden bg-cream-deep">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-coral/10 blur-3xl" />
      </div>
      <div className="container-page relative max-w-md py-14 sm:py-20">
        <p className="kicker justify-center text-coral">Rejoins le club</p>
        <SplitTitle
          text="Crée ton compte"
          as="h1"
          immediate
          accentWords={["compte"]}
          className="mt-2 text-center font-display text-4xl font-light tracking-tight text-espresso sm:text-5xl"
        />
        <p className="mb-8 mt-3 text-center text-sm text-cocoa/70">
          Commandes suivies. Adresse gardée. Codes membres en prime.
        </p>
        <GsapReveal delay={0.1}>
          <SignupForm />
        </GsapReveal>
      </div>
    </div>
  );
}
