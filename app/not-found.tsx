import Link from "next/link";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-cream-deep text-cocoa/60">
          <Ghost className="h-8 w-8" />
        </span>
        <p className="mt-4 font-display text-6xl font-light tracking-tight text-espresso/15">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl font-normal tracking-tight text-espresso">
          Page introuvable
        </h1>
        <p className="mt-2 text-cocoa/70">
          La page demandée n’existe pas ou n’est plus disponible.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
