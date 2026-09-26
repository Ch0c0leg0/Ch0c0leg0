"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BadgePercent,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { AddressPicker } from "@/components/address/address-picker";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/format";

type ProfilePrefill = {
  displayName?: string;
  email?: string;
  addressLine1?: string;
  addressCity?: string;
  addressPostalCode?: string;
  addressCountry?: string;
};

export function CheckoutForm() {
  const { items, total, hydrated } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [prefill, setPrefill] = useState<ProfilePrefill | null>(null);

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "error">("idle");
  const [promoError, setPromoError] = useState("");
  const [rates, setRates] = useState<{ id: number; label: string; price: number }[]>([
    { id: 1, label: "Domicile offerte", price: 0 },
    { id: 2, label: "Point relais", price: 490 },
  ]);
  const [carrier, setCarrier] = useState("domicile");
  const [remind, setRemind] = useState(false);

  useEffect(() => {
    fetch("/api/compte/profil")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) setPrefill(d.profile);
      })
      .catch(() => {});
    fetch("/api/shipping/rates")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.rates) && d.rates.length > 0) setRates(d.rates);
      })
      .catch(() => {});
  }, []);

  if (!hydrated) {
    return <p className="animate-pulse text-espresso/40">Chargement…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="card mx-auto max-w-xl p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-deep text-cocoa">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <p className="mt-4 font-display text-xl font-normal text-espresso">
          Ton panier est vide.
        </p>
        <p className="mt-1 text-sm text-cocoa/70">
          Pas d’articles. Pas de commande. Logique.
        </p>
        <Link href="/products" className="btn-coral mt-6">
          Voir le matos
        </Link>
      </div>
    );
  }

  const discountedTotal = Math.max(0, total - (promo?.discount ?? 0));
  const shippingPrice =
    carrier === "relais"
      ? (rates.find((r) => r.label.toLowerCase().includes("relais"))?.price ?? 490)
      : 0;
  const grandTotal = discountedTotal + shippingPrice;

  async function applyPromo() {
    const code = promoInput.trim();
    if (!code) return;
    setPromoStatus("loading");
    setPromoError("");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: total }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoStatus("error");
        setPromoError(data.error || "Code invalide.");
        return;
      }
      setPromo({ code: data.code, discount: data.discount, label: data.label });
      setPromoStatus("idle");
    } catch {
      setPromoStatus("error");
      setPromoError("Impossible de vérifier le code.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      customerName: String(form.get("name") ?? ""),
      customerEmail: String(form.get("email") ?? ""),
      addressLine1: String(form.get("line1") ?? ""),
      addressCity: String(form.get("city") ?? ""),
      addressPostalCode: String(form.get("postal") ?? ""),
      addressCountry: String(form.get("country") ?? "FR"),
      promoCode: promo?.code,
      carrier,
    };

    let res: Response;
    try {
      res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      setStatus("error");
      setError("Serveur injoignable. Attends un peu, puis réessaie.");
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    // Relance discrète si opt-in coché (panier abandonné).
    if (remind && payload.customerEmail.includes("@")) {
      fetch("/api/cart/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: payload.customerEmail,
          cart: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        }),
      }).catch(() => {});
    }
    setStatus("error");
    // Si la promo a expiré entre-temps, on la retire pour laisser réessayer.
    if (res.status === 400 && promo) setPromo(null);
    setError(
      data.error || "Commande non passée. Vérifie tes infos et réessaie."
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
      {/* key = remonte le formulaire quand le profil arrive (defaultValue) */}
      <form key={prefill ? "prefilled" : "guest"} onSubmit={handleSubmit} className="card space-y-8 p-6 sm:p-8">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-espresso text-cream">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
                01 — Contact
              </p>
              <h2 className="font-display text-xl font-normal text-espresso">
                C’est pour qui
              </h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">
                Nom complet
              </label>
              <input id="name" name="name" required defaultValue={prefill?.displayName ?? ""} className="input" placeholder="Marie Dupont" />
            </div>
            <div>
              <label className="label" htmlFor="email">
                E-mail
              </label>
              <input id="email" name="email" type="email" required defaultValue={prefill?.email ?? ""} className="input" placeholder="marie@exemple.fr" />
            </div>
          </div>
        </div>

        <div className="border-t border-espresso/10 pt-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-espresso text-cream">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
                02 — Livraison
              </p>
              <h2 className="font-display text-xl font-normal text-espresso">
                Où ça part
              </h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="line1">
                Adresse
              </label>
              <input id="line1" name="line1" required defaultValue={prefill?.addressLine1 ?? ""} className="input" placeholder="12 rue des Lilas" />
            </div>
            <div>
              <label className="label" htmlFor="city">
                Ville
              </label>
              <input id="city" name="city" required defaultValue={prefill?.addressCity ?? ""} className="input" placeholder="Paris" />
            </div>
            <div>
              <label className="label" htmlFor="postal">
                Code postal
              </label>
              <input id="postal" name="postal" required defaultValue={prefill?.addressPostalCode ?? ""} className="input" placeholder="75011" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="country">
                Pays
              </label>
              <select id="country" name="country" defaultValue={prefill?.addressCountry ?? "FR"} className="input">
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="CH">Suisse</option>
                <option value="LU">Luxembourg</option>
                <option value="CA">Canada</option>
              </select>
            </div>
            <AddressPicker />
            <fieldset className="sm:col-span-2">
              <legend className="label">Mode de livraison</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-sm ${carrier === "domicile" ? "border-espresso bg-cream-deep font-semibold" : "border-espresso/15"}`}>
                  <span className="flex items-center gap-2">
                    <input type="radio" name="carrier" checked={carrier === "domicile"} onChange={() => setCarrier("domicile")} className="accent-[#ff6b4a]" />
                    Domicile
                  </span>
                  <span className="badge-green">Offerte</span>
                </label>
                <label className={`flex cursor-pointer items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-sm ${carrier === "relais" ? "border-espresso bg-cream-deep font-semibold" : "border-espresso/15"}`}>
                  <span className="flex items-center gap-2">
                    <input type="radio" name="carrier" checked={carrier === "relais"} onChange={() => setCarrier("relais")} className="accent-[#ff6b4a]" />
                    Point relais
                  </span>
                  <span className="font-bold">{formatPrice(rates.find((r) => r.label.toLowerCase().includes("relais"))?.price ?? 490)}</span>
                </label>
              </div>
            </fieldset>
          </div>
        </div>

        <div className="border-t border-espresso/10 pt-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-honey/20 text-[#7a4d0c]">
              <BadgePercent className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
                03 — Réduction
              </p>
              <h2 className="font-display text-xl font-normal text-espresso">
                Un code ? Sors-le
              </h2>
            </div>
          </div>
          {promo ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-espresso/15 bg-cream-deep px-4 py-3.5">
              <p className="flex items-center gap-2 text-sm font-semibold text-espresso">
                <Tag className="h-4 w-4 text-espresso" />
                {promo.code} — {promo.label}
              </p>
              <button
                type="button"
                onClick={() => {
                  setPromo(null);
                  setPromoInput("");
                }}
                aria-label="Retirer le code promo"
                className="rounded-full p-1.5 text-espresso transition-colors hover:bg-espresso/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-espresso/10 bg-cream/60 p-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/30" />
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="input pl-9 uppercase placeholder:normal-case"
                    placeholder="Code promo"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyPromo}
                  disabled={promoStatus === "loading" || !promoInput.trim()}
                  className="btn-outline shrink-0"
                >
                  {promoStatus === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Appliquer"
                  )}
                </button>
              </div>
              {promoStatus === "error" && (
                <p className="mt-2 px-1 text-sm font-medium text-red-600">{promoError}</p>
              )}
            </div>
          )}
        </div>

        {status === "error" && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-coral w-full py-4 text-base"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Redirection vers Stripe…
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" /> Payer {formatPrice(grandTotal)} avec Stripe
              </>
            )}
          </button>
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 text-xs text-cocoa/60">
            <input type="checkbox" checked={remind} onChange={(e) => setRemind(e.target.checked)} className="accent-[#ff6b4a]" />
            Me rappeler ce panier par e-mail si je ne termine pas
          </label>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-cocoa/60">
            <ShieldCheck className="h-3.5 w-3.5" />
            Tu passes sur Stripe pour payer. On ne voit jamais ta carte.
            Tant mieux.
          </p>
        </div>
      </form>

      {/* Résumé */}
      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <p className="kicker text-coral">Récapitulatif</p>
        <h2 className="mt-1 font-display text-xl font-normal text-espresso">
          Ta commande
        </h2>
        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                <ProductImage
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium leading-tight text-espresso">{item.name}</p>
                <p className="text-cocoa/60">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="shrink-0 font-sans text-sm font-bold text-espresso">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-espresso/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-cocoa/70">Sous-total</dt>
            <dd className="font-sans font-bold text-espresso">{formatPrice(total)}</dd>
          </div>
          {promo && (
            <div className="flex justify-between font-sans font-bold text-espresso">
              <dt>Remise ({promo.code})</dt>
              <dd>−{formatPrice(promo.discount)}</dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1.5 text-cocoa/70">
              <Truck className="h-4 w-4" /> Livraison
            </dt>
            <dd className={shippingPrice === 0 ? "badge-green" : "font-bold text-espresso"}>
              {shippingPrice === 0 ? "Offerte" : formatPrice(shippingPrice)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-espresso/10 pt-3 font-sans text-lg font-bold text-espresso">
            <dt>Total</dt>
            <dd>{formatPrice(grandTotal)}</dd>
          </div>
        </dl>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-cream/70 px-4 py-3 text-xs text-cocoa/70">
          <ShieldCheck className="h-4 w-4 shrink-0 text-espresso" />
          Paiement chiffré. Expédié sous 48h. Sans excuse.
        </div>
      </aside>
    </div>
  );
}
