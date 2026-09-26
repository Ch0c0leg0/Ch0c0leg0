import type { Metadata } from "next";
import { FaqList } from "@/components/aide/faq-list";

export const metadata: Metadata = { title: "Aide & FAQ" };

const FAQS: { q: string; a: string }[] = [
  {
    q: "Comment passer commande ?",
    a: "Ajoute tes articles au panier, vérifie le récap, remplis tes coordonnées et paie par carte via Stripe. Tu reçois un e-mail de confirmation avec ton numéro de commande.",
  },
  {
    q: "Le paiement est-il sécurisé ?",
    a: "Oui. La carte est traitée par Stripe dans une page sécurisée : ton numéro ne passe jamais par nos serveurs et on ne le stocke pas.",
  },
  {
    q: "Quels sont les délais et frais de livraison ?",
    a: "La livraison est offerte. Compte 2 à 5 jours ouvrés en France métropolitaine. Détails sur la page Livraison & retours.",
  },
  {
    q: "Puis-je retourner un article ?",
    a: "Oui, 14 jours après réception, sans motif. Voir Livraison & retours pour la marche à suivre.",
  },
  {
    q: "Comment utiliser un code promo ?",
    a: "Colle-le dans le champ « Code promo » à l'étape de commande, avant de payer. La remise s'applique immédiatement au total.",
  },
  {
    q: "Faut-il un compte pour commander ?",
    a: "Non, les invités commandent librement. Un compte permet de pré-remplir tes infos, suivre tes commandes et garder tes favoris.",
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Connecté : page Mes commandes. Invité : page Suivre ma commande avec ton numéro et ton e-mail.",
  },
  {
    q: "Comment laisser un avis ?",
    a: "Sur la fiche du produit, rubrique « Ils en parlent ». Il faut être connecté ; ton avis est relu par l'équipe avant publication.",
  },
  {
    q: "Un produit est épuisé, que faire ?",
    a: "Reviens vite : les réassorts sont fréquents. Les favoris t'aident à garder l'œil dessus.",
  },
  {
    q: "Comment vous contacter ?",
    a: "Via la page Contact : on répond en général sous 24 h ouvrées.",
  },
];

export default function AidePage() {
  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <h1 className="display-section font-display font-light text-espresso">
        On t'aide ?
      </h1>
      <p className="mt-2 text-sm font-light text-cocoa/65">
        Les réponses aux questions qu'on nous pose tout le temps.
      </p>
      <div className="mt-8">
        <FaqList faqs={FAQS} />
      </div>
    </div>
  );
}
