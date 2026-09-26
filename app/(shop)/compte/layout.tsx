"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Star, UserRound } from "lucide-react";
import { logoutCustomerAction } from "./actions";
import { LogoutButton } from "@/components/compte/logout-button";
import { FavorisMergeOnMount } from "@/components/compte/favoris-merge-on-mount";

export default function CompteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfil = pathname === "/compte";
  const isCommandes = pathname?.startsWith("/compte/commandes") ?? false;
  const isAvis = pathname?.startsWith("/compte/avis") ?? false;

  const linkClass = (active: boolean) =>
    active
      ? "flex items-center gap-2.5 rounded-full bg-espresso px-4 py-2.5 text-sm font-semibold text-cream shadow-warm"
      : "flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-semibold text-cocoa transition-all hover:bg-cream-deep hover:text-espresso";

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
      <FavorisMergeOnMount />
      <aside className="card h-fit p-3 lg:sticky lg:top-24">
        <p className="kicker px-3 pb-2 pt-1 text-coral">Espace client</p>
        <nav className="flex gap-1.5 overflow-x-auto lg:flex-col">
          <Link
            href="/compte"
            aria-current={isProfil ? "page" : undefined}
            className={linkClass(isProfil)}
          >
            <UserRound className="h-4 w-4" /> Mon profil
          </Link>
          <Link
            href="/compte/commandes"
            aria-current={isCommandes ? "page" : undefined}
            className={linkClass(isCommandes)}
          >
            <Package className="h-4 w-4" /> Mes commandes
          </Link>
          <Link
            href="/compte/avis"
            aria-current={isAvis ? "page" : undefined}
            className={linkClass(isAvis)}
          >
            <Star className="h-4 w-4" /> Mes avis
          </Link>
        </nav>
        <form action={logoutCustomerAction} className="mt-2 border-t border-espresso/10 pt-2">
          <LogoutButton />
        </form>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
