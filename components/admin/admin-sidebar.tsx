"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Truck,
  Users,
  TicketPercent,
  Star,
  BookOpen,
  MailOpen,
  Inbox,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { LogoMark } from "@/components/brand/logo";

const NAV = [
  { href: "/admin", label: "Tableau de bord", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Produits", Icon: Package },
  { href: "/admin/categories", label: "Catégories", Icon: Tags },
  { href: "/admin/orders", label: "Commandes", Icon: ShoppingCart },
  { href: "/admin/livraison", label: "Livraison", Icon: Truck },
  { href: "/admin/utilisateurs", label: "Utilisateurs", Icon: Users },
  { href: "/admin/promos", label: "Codes promo", Icon: TicketPercent },
  { href: "/admin/avis", label: "Avis clients", Icon: Star },
  { href: "/admin/guides", label: "Guides", Icon: BookOpen },
  { href: "/admin/newsletter", label: "Newsletter", Icon: MailOpen },
  { href: "/admin/messages", label: "Messages", Icon: Inbox },
];

export function AdminSidebar({ pendingReviews = 0 }: { pendingReviews?: number }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-espresso/10 bg-cream lg:w-64">
      <div className="flex items-center justify-center px-3 py-5 lg:justify-between lg:px-5">
        <Link
          href="/admin"
          aria-label="Ch0c0leg0 — administration"
          className="group/logo flex items-center gap-2.5"
        >
          <LogoMark className="h-9 w-9 shrink-0" />
          <span className="hidden flex-col leading-none lg:flex" aria-hidden>
            <span className="font-display text-lg font-normal tracking-tight text-espresso">
              Ch0c0leg0
            </span>
            <span className="mt-0.5 text-[9px] font-normal uppercase tracking-[0.3em] text-cocoa/55">
              Admin
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 px-3">
        <p className="hidden px-2 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cocoa/50 lg:block">
          Pilotage
        </p>
        {NAV.map(({ href, label, Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 ${
                active
                  ? "bg-espresso text-cream shadow-warm"
                  : "bg-cream-deep/70 text-cocoa hover:-translate-y-px hover:bg-cream-deep hover:text-espresso"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
              {href === "/admin/avis" && pendingReviews > 0 && (
                <span className="ml-auto hidden rounded-full bg-coral px-2 py-0.5 text-[11px] font-bold text-white lg:block">
                  {pendingReviews}
                </span>
              )}
              {active && href !== "/admin/avis" && (
                <span
                  aria-hidden
                  className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-honey lg:block"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1.5 border-t border-espresso/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-2xl bg-cream-deep/50 px-3 py-2.5 text-sm font-semibold text-cocoa transition-all duration-300 hover:bg-cream-deep hover:text-espresso"
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          <span className="hidden lg:inline">Voir la boutique</span>
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-cocoa transition-colors hover:bg-coral/10 hover:text-[#b23a20]"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="hidden lg:inline">Déconnexion</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
