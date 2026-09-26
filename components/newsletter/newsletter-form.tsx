"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading" || status === "done") return;
    setStatus("loading");
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          website: String(form.get("website") ?? ""),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Inscription impossible.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Impossible de contacter le serveur.");
    }
  }

  if (status === "done") {
    return (
      <p className="flex items-center gap-2 rounded-2xl border border-cream/20 bg-cream/10 px-4 py-3 text-sm text-cream">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-honey" />
        Bien noté. Les bonnes affaires arrivent par e-mail.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative">
        <input
          name="email"
          type="email"
          required
          placeholder="ton@email.fr"
          aria-label="E-mail pour la newsletter"
          className="w-full rounded-full border border-cream/20 bg-cream/10 py-2.5 pl-4 pr-11 text-sm text-cream placeholder:text-cream/40 focus:border-cream/50 focus:outline-none"
        />
        {/* Honeypot anti-bot (invisible) */}
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute left-0 top-0 h-px w-px opacity-0"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label="S'inscrire à la newsletter"
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-coral text-white transition-transform duration-300 hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs font-medium text-coral">{error}</p>
      )}
    </form>
  );
}
