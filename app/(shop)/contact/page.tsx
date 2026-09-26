import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container-page max-w-2xl py-10 md:py-14">
      <h1 className="display-section font-display font-light text-espresso">
        Écris-nous.
      </h1>
      <p className="mt-2 text-sm font-light text-cocoa/65">
        Une vraie personne lit et répond — en général sous 24 h ouvrées.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
