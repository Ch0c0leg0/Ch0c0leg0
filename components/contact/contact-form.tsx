"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading" || status === "done") return;
    setStatus("loading");
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          subject: String(form.get("subject") ?? ""),
          message: String(form.get("message") ?? ""),
          website: String(form.get("website") ?? ""),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Envoi impossible.");
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
      <div className="card p-10 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-espresso" />
        <p className="mt-4 font-display text-2xl font-normal text-espresso">
          Bien reçu.
        </p>
        <p className="mt-1 text-sm font-light text-cocoa/65">
          On te répond en général sous 24 h ouvrées. À très vite.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">Ton nom *</label>
          <input id="c-name" name="name" required className="input" placeholder="Marie Dupont" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="c-email">Ton e-mail *</label>
          <input id="c-email" name="email" type="email" required className="input" placeholder="toi@exemple.fr" autoComplete="email" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="c-subject">Sujet *</label>
        <select id="c-subject" name="subject" required defaultValue="" className="input">
          <option value="" disabled>De quoi s'agit-il ?</option>
          <option value="commande">Ma commande</option>
          <option value="livraison">Livraison / retour</option>
          <option value="produit">Question produit</option>
          <option value="compte">Mon compte</option>
          <option value="autre">Autre chose</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="c-message">Message *</label>
        <textarea
          id="c-message"
          name="message"
          required
          rows={5}
          minLength={10}
          className="input resize-y"
          placeholder="Raconte-nous tout, avec ton numéro de commande si ça concerne un achat."
        />
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute h-px w-px opacity-0" />
      {status === "error" && (
        <p className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-medium text-[#b23a20]">
          {error}
        </p>
      )}
      <button type="submit" disabled={status === "loading"} className="btn-coral w-full sm:w-auto">
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Envoyer
      </button>
    </form>
  );
}
