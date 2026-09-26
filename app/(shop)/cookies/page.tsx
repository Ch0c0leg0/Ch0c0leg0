import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Cookies" };

const SECTIONS = [
  {
    title: "Ce qu'on dépose",
    body: [
      "Strictement nécessaire uniquement : session de connexion (Supabase Auth), panier (localStorage de ton navigateur), ton choix cookies (localStorage). Aucun traceur publicitaire, aucune revente.",
    ],
  },
  {
    title: "Ton choix",
    body: [
      "Le bandeau en bas d'écran propose Accepter ou Refuser. Les deux laissent le site entièrement utilisable. Tu peux changer d'avis à tout moment en effaçant la clé ch0c0leg0_cookies de ton navigateur.",
    ],
  },
  {
    title: "Mesure d'audience",
    body: [
      "Aucune pour l'instant. Si on en ajoute une (respectueuse, sans cookies tiers), elle sera listée ici avant activation.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      kicker="Transparence"
      title="Cookies"
      updated="Dernière mise à jour : septembre 2026."
      sections={SECTIONS}
    />
  );
}
