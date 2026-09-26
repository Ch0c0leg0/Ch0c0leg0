import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Confidentialité" };

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Ce qu'on collecte (et pourquoi)",
    body: [
      "Compte : identifiant, e-mail, adresse (pour pré-remplir tes commandes). Commandes : coordonnées de livraison, contenu, montants (obligations comptables et suivi). Avis : pseudo, note, texte (modérés avant publication). Newsletter : e-mail uniquement, si tu t'inscris. Contact : ce que tu nous écris.",
      "Paiement : traité par Stripe — on ne voit ni ne stocke jamais ton numéro de carte.",
    ],
  },
  {
    title: "Cookies",
    body: [
      "Strictement nécessaires : session de connexion (Supabase), panier (ton navigateur uniquement), choix cookies. Aucun traceur publicitaire, aucune revente de données. Le bandeau cookies te laisse accepter ou refuser ; le refus ne bloque rien.",
    ],
  },
  {
    title: "Durées",
    body: [
      "Compte : jusqu'à suppression. Commandes : durée légale comptable. Avis publiés : jusqu'à retrait. Newsletter : jusqu'à désinscription (lien dans chaque e-mail ou page Contact).",
    ],
  },
  {
    title: "Tes droits",
    body: [
      "Accès, rectification, suppression, portabilité, opposition : écris via la page Contact en précisant l'e-mail du compte. Réponse sous un mois. Réclamation possible auprès de la CNIL (cnil.fr).",
    ],
  },
  {
    title: "Sécurité",
    body: [
      "Mots de passe gérés par Supabase Auth (jamais en clair chez nous), accès admin restreint, clés service confinées au serveur.",
    ],
  },
];

export default function ConfidentialitePage() {
  return (
    <LegalPage
      kicker="RGPD"
      title="Confidentialité"
      updated="Dernière mise à jour : septembre 2026."
      sections={SECTIONS}
    />
  );
}
