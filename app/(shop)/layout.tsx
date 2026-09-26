import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FirebaseAnalytics } from "@/components/site/firebase-analytics";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { CartDrawer } from "@/components/cart/cart-drawer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FirebaseAnalytics />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CookieBanner />
      <CartDrawer />
    </>
  );
}