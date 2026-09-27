import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-provider";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mirage = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    { path: "../public/fonts/mirage-light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/mirage-light-italic.woff2", weight: "300", style: "italic" },
    { path: "../public/fonts/mirage-regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/mirage-italic.woff2", weight: "400", style: "italic" },
  ],
});

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Ch0c0leg0 — Matériel gaming, livré chez toi",
    template: "%s — Ch0c0leg0",
  },
  description:
    "Boutique gaming Ch0c0leg0 : claviers, souris, tapis, casques, écrans, chaises et manettes sélectionnés par des joueurs.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Ch0c0leg0",
    title: "Ch0c0leg0 — Matériel gaming, livré chez toi",
    description:
      "Claviers, souris, casques, écrans et chaises gaming sélectionnés par des joueurs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ch0c0leg0 — Matériel gaming",
    description:
      "Boutique gaming : claviers, souris, casques, écrans, chaises et manettes.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${mirage.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream font-light text-espresso">
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
