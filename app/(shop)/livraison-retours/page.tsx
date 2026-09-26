import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { getShippingRates } from "@/lib/queries";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Livraison & retours" };

export default async function LivraisonPage() {
  const rates = await getShippingRates("FR").catch(() => []);
  const domicile = rates.find((r) => r.price === 0);
  const relais = rates.find((r) => r.label.toLowerCase().includes("relais"));

  const sections: { title: string; body: string[] }[] = [
    {
      title: domicile ? `Livraison ${domicile.label.toLowerCase()}` : "Livraison offerte",
      body: [
        `Domicile : ${domicile ? formatPrice(domicile.price) : "offerte"}${
          relais ? ` — Point relais : ${formatPrice(relais.price)}` : ""
        }. Compte 2 à 5 jours ouvrés en France métropolitaine (délais indicatifs, un peu plus longs vers la Corse, les DOM et l'international).`,
        "Chaque colis est préparé avec soin et suivi. Ton numéro de commande permet de suivre l'avancement depuis la page Suivre ma commande (ou Mes commandes si tu as un compte).",
      ],
    },
    {
      title: "Problème de livraison ?",
      body: [
        "Colis en retard, abîmé ou incomplet : écris-nous via la page Contact avec ton numéro de commande et, si possible, des photos. On règle ça vite, promis.",
      ],
    },
    {
      title: "Retours sous 14 jours",
      body: [
        "Tu as 14 jours après réception pour changer d'avis, sans te justifier. Le produit doit revenir complet et en état correct (l'essayage normal ne pose aucun problème).",
        "Marche à suivre : contacte-nous pour signaler le retour, renvoie le colis soigneusement emballé, on te rembourse sous 14 jours après réception, sur le même moyen de paiement.",
      ],
    },
    {
      title: "Garanties",
      body: [
        "Garantie légale de conformité : 2 ans. Panne, défaut, vice caché : contacte-nous avec photos et description, on te propose réparation, remplacement ou remboursement.",
      ],
    },
  ];

  return (
    <>
      <LegalPage
        kicker="Logistique"
        title="Livraison & retours"
        updated="Offerte à domicile, 14 jours pour changer d'avis."
        sections={sections}
      />
      <p className="container-page max-w-3xl pb-12 text-sm font-light text-cocoa/65">
        Une question ?{" "}
        <Link href="/contact" className="font-normal underline underline-offset-4 hover:text-coral">
          Écris-nous
        </Link>
      </p>
    </>
  );
}
