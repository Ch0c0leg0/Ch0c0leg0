"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, TriangleAlert, User, Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Retour à la page admin demandée (cf. proxy ?next=…), sinon l'accueil admin.
        const dest =
          new URLSearchParams(window.location.search).get("next") ?? "";
        router.push(dest.startsWith("/admin") && !dest.startsWith("//") ? dest : "/admin");
        router.refresh();
      } else {
        setError(data.error || "Connexion impossible.");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="username">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-cocoa/60" /> Nom d’utilisateur
          </span>
        </label>
        <input
          id="username"
          name="username"
          required
          autoComplete="username"
          className="input"
          placeholder="admin"
        />
      </div>
      <div>
        <label className="label" htmlFor="password">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-cocoa/60" /> Mot de passe
          </span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-medium text-[#b23a20]">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full py-3">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Connexion…
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" /> Se connecter
          </>
        )}
      </button>

      <p className="text-center text-xs text-cocoa/50">
        Identifiants par défaut : admin / admin123
      </p>
    </form>
  );
}
