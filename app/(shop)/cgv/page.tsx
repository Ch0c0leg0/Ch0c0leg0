import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Conditions générales de vente" };

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Objet",
    body: [
      "Les présentes conditions régissent les ventes réalisées sur la boutique Ch0c0leg0 (ci-après « nous »). Toute commande implique ton adhésion sans réserve à ces conditions.",
    ],
  },
  {
    title: "2. Produits et prix",
    body: [
      "Les produits proposés sont du matériel informatique et gaming neuf, décrits avec leurs caractéristiques essentielles (photos non contractuelles en cours de remplacement). Les prix sont indiqués en euros, toutes taxes comprises. Le stock affiché est le stock réel : si un article est épuisé, la vente est impossible.",
      "Les codes promo (ex. offre de bienvenue) s'appliquent au panier selon leurs conditions (montant minimum, date limite, nombre d'usages). Ils ne sont ni échangeables ni remboursables en espèces.",
    ],
  },
  {
    title: "3. Commande et paiement",
    body: [
      "La commande est ferme après paiement. Le paiement s'effectue en ligne par carte bancaire via Stripe, dans un environnement sécurisé : aucune donnée bancaire ne transite par nos serveurs. La commande est confirmée par e-mail (adresse fournie au checkout).",
      "Tant que le site est en mode test Stripe, aucun débit réel n'est effectué.",
    ],
  },
  {
    title: "4. Livraison",
    body: [
      "La livraison est offerte. Les délais sont indiqués à titre indicatif. En cas de retard important, contacte-nous via la page Contact : tu peux annuler et être remboursé.",
    ],
  },
  {
    title: "5. Rétractation et retours",
    body: [
      "Tu disposes de 14 jours après réception pour changer d'avis, sans motif (article L221-18 du Code de la consommation). Le produit doit être retourné complet et en état. Remboursement sous 14 jours après réception du retour, par le même moyen de paiement.",
      "Les produits descellés dont la nature l'exige (logiciels, consommables) et le matériel manifestement utilisé au-delà de l'essayage peuvent être exclus, conformément à la loi.",
    ],
  },
  {
    title: "6. Garanties",
    body: [
      "Tous nos produits bénéficient de la garantie légale de conformité (2 ans) et de la garantie des vices cachés. En cas de panne, contacte-nous : réparation, remplacement ou remboursement selon le cas.",
    ],
  },
  {
    title: "7. Compte client et avis",
    body: [
      "La création d'un compte est gratuite. Tu es responsable de la confidentialité de ton mot de passe. Les avis déposés sont relus par notre équipe avant publication ; les contenus injurieux, faux ou hors sujet sont refusés.",
    ],
  },
  {
    title: "8. Données personnelles",
    body: [
      "Voir la page Confidentialité. Tu disposes d'un droit d'accès, de rectification et de suppression : écris-nous via la page Contact.",
    ],
  },
  {
    title: "9. Litiges",
    body: [
      "En cas de désaccord, écris-nous d'abord : on règle ça entre humains. À défaut, tu peux recourir à la médiation de la consommation, puis aux tribunaux français.",
    ],
  },
  {
    title: "10. Coordonnées",
    body: [
      "À COMPLÉTER — raison sociale, adresse postale, e-mail, téléphone, SIREN. Ces mentions sont obligatoires avant toute vente réelle.",
    ],
  },
];

export default function CgvPage() {
  return (
    <LegalPage
      kicker="En vigueur"
      title="Conditions générales de vente"
      updated="Dernière mise à jour : septembre 2026."
      sections={SECTIONS}
    />
  );
}
