import Link from "next/link";
import { CreditCard, Truck, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="section-dark mt-auto overflow-hidden">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div>
          <Logo variant="light" size="md" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/65">
            Du matos testé par des joueurs. Pas de blabla. Livré chez toi,
            payé via Stripe.
          </p>
          <div className="mt-5 flex gap-2">
            {["FR", "BE", "CH"].map((z) => (
              <span
                key={z}
                className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold tracking-widest text-cream/60"
              >
                {z}
              </span>
            ))}
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
              Newsletter
            </p>
            <NewsletterForm />
          </div>
        </div>
        <FooterCol
          title="Boutique"
          links={[
            { href: "/products", label: "Tous les produits" },
            { href: "/categories", label: "Catégories" },
            { href: "/cart", label: "Mon panier" },
          ]}
        />
        <FooterCol
          title="Compte"
          links={[
            { href: "/connexion", label: "Connexion" },
            { href: "/inscription", label: "Créer un compte" },
            { href: "/compte/commandes", label: "Mes commandes" },
          ]}
        />
        <FooterCol
          title="Aide"
          links={[
            { href: "/suivi", label: "Suivre ma commande" },
            { href: "/aide", label: "FAQ" },
            { href: "/livraison-retours", label: "Livraison & retours" },
            { href: "/contact", label: "Contact" },
          ]}
        />
        <FooterCol
          title="Légal"
          links={[
            { href: "/cgv", label: "CGV" },
            { href: "/mentions-legales", label: "Mentions légales" },
            { href: "/confidentialite", label: "Confidentialité" },
            { href: "/cookies", label: "Cookies" },
            { href: "/guides", label: "Guides" },
          ]}
        />
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-honey">
            Garanties
          </p>
          <ul className="space-y-3 text-sm text-cream/75">
            <li className="flex items-center gap-2.5">
              <CreditCard className="h-4 w-4 shrink-0 text-cream/60" /> Stripe. Rien ne fuite.
            </li>
            <li className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 shrink-0 text-cream/60" /> Livraison offerte. Point.
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-cream/60" /> Stock réel. Pas de fantômes.
            </li>
          </ul>
        </div>
      </div>
      {/* Wordmark géant — overflow visible + marge basse pour les descendantes (g) */}
      <div aria-hidden className="select-none overflow-visible px-4">
        <p className="font-display -mb-[0.04em] text-center font-light leading-[0.95] tracking-tight text-cream/[0.06]" style={{ fontSize: "16.5vw", paddingBottom: "0.14em" }}>
          Ch0c0leg0
        </p>
      </div>
      <div className="border-t border-white/10 py-4">
        <p className="container-page text-xs text-cream/40">
          © {new Date().getFullYear()} Ch0c0leg0 — Paiements en mode test Stripe.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-honey">
        {title}
      </p>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group inline-flex items-center gap-1 text-cream/70 transition-colors hover:text-cream"
            >
              {l.label}
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
