import Link from "next/link";
import { User } from "lucide-react";
import { getCategories } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { CartBadge } from "@/components/cart/cart-badge";
import { FavorisBadge } from "@/components/favoris/favoris-badge";
import { Logo } from "@/components/brand/logo";
import { MobileMenu } from "@/components/site/mobile-menu";
import { SearchExpand } from "@/components/site/search-expand";

export async function SiteHeader() {
  const [cats, supabase] = await Promise.all([
    getCategories(),
    createClient().catch(() => null),
  ]);
  let loggedIn = false;
  try {
    const { data } = await supabase!.auth.getUser();
    loggedIn = Boolean(data.user);
  } catch {
    loggedIn = false;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-espresso/10 bg-cream/85 backdrop-blur-xl">
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MobileMenu categories={cats} />
          <Logo size="sm" />
        </div>

        <nav className="hidden items-center gap-1 text-sm font-normal md:flex">
          {[
            { href: "/products", label: "Boutique" },
            { href: "/categories", label: "Catégories" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group relative rounded-full px-4 py-2 text-cocoa transition-colors hover:text-espresso"
            >
              {l.label}
              <span className="absolute inset-x-4 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-coral transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
          <span aria-hidden className="mx-1 h-4 w-px bg-espresso/15" />
          {cats.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group relative rounded-full px-3 py-2 text-cocoa transition-colors hover:text-espresso"
            >
              {c.name}
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-honey transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <SearchExpand />
          <FavorisBadge />
          <Link
            href={loggedIn ? "/compte" : "/connexion"}
            aria-label={loggedIn ? "Mon compte" : "Se connecter"}
            className="group flex h-10 w-10 items-center justify-center rounded-full text-espresso transition-all duration-300 hover:bg-espresso hover:text-cream"
          >
            <User className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          </Link>
          <CartBadge />
        </div>
      </div>
    </header>
  );
}
