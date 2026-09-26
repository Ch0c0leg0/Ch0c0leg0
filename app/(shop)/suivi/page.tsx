import type { Metadata } from "next";
import { SuiviForm } from "@/components/suivi/suivi-form";

export const metadata: Metadata = { title: "Suivre ma commande" };

export default function SuiviPage() {
  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="display-section text-center font-display font-light text-espresso">
        Où en est ma commande ?
      </h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm font-light text-cocoa/65">
        Le numéro reçu par e-mail + l'e-mail de commande. Pas besoin de compte.
      </p>
      <div className="mt-8">
        <SuiviForm />
      </div>
    </div>
  );
}
