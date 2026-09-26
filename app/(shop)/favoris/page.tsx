import type { Metadata } from "next";
import { FavorisView } from "@/components/favoris/favoris-view";

export const metadata: Metadata = { title: "Mes favoris" };

export default function FavorisPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="display-section font-display font-light text-espresso">
        Mes favoris
      </h1>
      <p className="mt-2 text-sm font-light text-cocoa/65">
        Tes coups de cœur, synchronisés avec ton compte quand tu es connecté.
      </p>
      <div className="mt-8">
        <FavorisView />
      </div>
    </div>
  );
}
