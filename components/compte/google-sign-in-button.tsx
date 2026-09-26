"use client";

import { useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Bouton « Continuer avec Google » partagé (connexion + inscription). */
export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/compte`,
        },
      });
      if (oauthError) {
        setError("Connexion Google impossible. Réessaie.");
        setLoading(false);
      }
      // Sinon : redirection plein écran vers Google, gérée par Supabase.
    } catch {
      setError("Connexion Google impossible. Réessaie.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn-outline w-full py-3.5"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleG className="h-4 w-4" />
        )}
        {loading ? "Redirection…" : "Continuer avec Google"}
      </button>
      {error && (
        <p className="mt-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

/** « G » multicolore officiel (lucide ne fournit pas d'icônes de marques). */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.3 3.5 2.7.2.1c2.2-2 3.8-5 3.8-9.1Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.6 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5l-.3.1-3.7 2.9v.2C3.2 21.5 7.3 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.3-3.6-2.8-.1.1C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.4l3.8-3Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.2 2.5 1.4 6.6l3.8 3c.9-2.9 3.6-4.9 6.8-4.9Z"
      />
    </svg>
  );
}
