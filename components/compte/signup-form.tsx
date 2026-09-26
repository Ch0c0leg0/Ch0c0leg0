"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, MailCheck, Lock, User, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/compte/google-sign-in-button";

export function SignupForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "check-email">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = new FormData(e.currentTarget);
    const displayName = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (password.length < 8) {
      setStatus("error");
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    const supabase = createClient();
    const { data, error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/compte`,
      },
    });
    if (signError) {
      setStatus("error");
      setError(
        signError.message.includes("already registered")
          ? "Un compte existe déjà avec cet e-mail. Connecte-toi."
          : "Inscription impossible. Réessaie."
      );
      return;
    }
    if (data.session) {
      router.push("/compte");
      router.refresh();
    } else {
      // Confirmation e-mail requise côté Supabase.
      setStatus("check-email");
    }
  }

  if (status === "check-email") {
    return (
      <div className="card space-y-3 p-6 text-center shadow-warm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-deep text-espresso">
          <MailCheck className="h-7 w-7" />
        </div>
        <p className="font-display text-xl font-normal text-espresso">Vérifie ta boîte e-mail</p>
        <p className="text-sm text-cocoa/70">
          Lien envoyé. Clique dessus, connecte-toi, et c’est réglé.
        </p>
        <Link href="/connexion" className="btn-primary w-full">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6 shadow-warm sm:p-8">
      <div>
        <label className="label" htmlFor="name">
          Identifiant (pseudo)
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/30" />
          <input
            id="name"
            name="name"
            required
            autoComplete="nickname"
            className="input pl-9"
            placeholder="PixelWarrior"
          />
        </div>
      </div>
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
          Mot de passe (8 caractères min.)
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/30" />
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
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
        <UserPlus className="h-4 w-4" />
        {status === "loading" ? "Création…" : "Créer mon compte"}
      </button>

      <div className="divider-dots" aria-hidden />

      <GoogleSignInButton />

      <div className="divider-dots" aria-hidden />

      <p className="text-center text-sm text-cocoa/70">
        Déjà des nôtres ?{" "}
        <Link href="/connexion" className="font-semibold text-espresso underline decoration-coral/50 underline-offset-4 transition-colors hover:decoration-coral">
          Connecte-toi
        </Link>
      </p>
    </form>
  );
}
