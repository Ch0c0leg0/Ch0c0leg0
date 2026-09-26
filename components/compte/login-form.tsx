"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/compte/google-sign-in-button";
import { mergeLocalIntoAccount } from "@/lib/favoris-store";

export function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signError) {
      setStatus("error");
      setError(
        signError.message === "Invalid login credentials"
          ? "E-mail ou mot de passe incorrect."
          : "Connexion impossible. Réessaie."
      );
      return;
    }
    router.push("/compte");
    router.refresh();
    mergeLocalIntoAccount().catch(() => {});
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6 shadow-warm sm:p-8">
      <div>
        <label className="label" htmlFor="email">
          Adresse e-mail
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/30" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input pl-9"
            placeholder="toi@exemple.fr"
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/30" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="input pl-9"
            placeholder="••••••••"
          />
        </div>
      </div>

      {status === "error" && (
        <p className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <button type="submit" disabled={status === "loading"} className="btn-primary w-full py-3.5">
        <LogIn className="h-4 w-4" />
        {status === "loading" ? "Connexion…" : "Se connecter"}
      </button>

      <div className="divider-dots" aria-hidden />

      <GoogleSignInButton />

      <div className="divider-dots" aria-hidden />

      <p className="text-center text-sm text-cocoa/70">
        Toujours pas de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-espresso underline decoration-coral/50 underline-offset-4 transition-colors hover:decoration-coral">
          Crée le tien
        </Link>
      </p>
    </form>
  );
}
