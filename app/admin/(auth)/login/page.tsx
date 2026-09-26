import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isAdmin } from "@/lib/session";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Connexion admin",
};

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream-deep p-4">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-coral/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="card p-8 shadow-warm">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo href="/" size="md" variant="dark" />
            <span className="mt-3 inline-flex rounded-full bg-honey/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-cocoa">
              Admin
            </span>
            <p className="font-display mt-3 text-xl font-normal tracking-tight text-espresso">
              Bienvenue chez Ch0c0leg0
            </p>
            <p className="mt-1 text-sm text-cocoa/60">
              Connectez-vous pour gérer votre boutique
            </p>
          </div>
          <LoginForm />
        </div>
        <p className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cocoa/70 hover:text-espresso"
          >
            <ArrowLeft className="h-4 w-4" /> Retour à la boutique
          </Link>
        </p>
      </div>
    </div>
  );
}
