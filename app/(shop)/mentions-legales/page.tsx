import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Mentions légales" };

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Éditeur du site",
    body: [
      "À COMPLÉTER — nom / raison sociale, adresse postale, e-mail, téléphone, capital social, SIREN + RCS.",
    ],
  },
  {
    title: "Directeur de la publication",
    body: ["À COMPLÉTER — nom du responsable."],
  },
  {
    title: "Hébergement",
    body: [
      "Application Next.js — hébergeur à préciser. Base de données et authentification : Supabase (supabase.com). Paiement : Stripe (stripe.com).",
    ],
  },
  {
    title: "Propriété intellectuelle",
    body: [
      "Le nom Ch0c0leg0, le logo, les textes et la charte du site sont protégés. Les photos produits appartiennent à la boutique. Toute reproduction sans accord est interdite.",
    ],
  },
  {
    title: "Données personnelles",
    body: [
      "Voir la page Confidentialité pour le détail (comptes, commandes, avis, newsletter, cookies).",
    ],
  },
];

export default function MentionsPage() {
  return (
    <LegalPage
      kicker="Obligatoire"
      title="Mentions légales"
      updated="Dernière mise à jour : septembre 2026."
      sections={SECTIONS}
    />
  );
}
