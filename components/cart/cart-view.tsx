"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgePercent,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/product-image";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { Product } from "@/lib/supabase/types";

export function CartView() {
  const { items, total, updateQuantity, removeItem, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse py-20 text-center text-espresso/40">
        Chargement…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center sm:py-16">
        <div className="card p-10 sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cream-deep text-cocoa">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <p className="kicker mt-6 justify-center text-coral">Panier vide</p>
          <p className="mt-2 font-display text-3xl font-normal tracking-tight text-espresso">
            Rien ici.
          </p>
          <p className="mt-2 text-sm text-cocoa/70">
            Ton panier est vide, mais ça se soigne vite. Le matos qui
            te correspond est à un clic.
          </p>
          <Link href="/products" className="btn-coral mt-8">
            Voir le matos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="kicker text-coral">Ta sélection</p>
          <span className="badge-coral">
            {items.length} article{items.length > 1 ? "s" : ""}
          </span>
        </div>
        {items.map((item) => (
          <div
            key={item.productId}
            className="card flex gap-4 p-4 transition-shadow duration-300 hover:shadow-warm sm:p-5"
          >
            <Link
              href={`/products/${item.slug}`}
              className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream-deep"
            >
              <ProductImage
                src={item.imageUrl || "/placeholder.svg"}
                alt={item.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-semibold text-espresso transition-colors hover:text-coral"
                >
                  {item.name}
                </Link>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  aria-label="Retirer du panier"
                  className="rounded-full p-2 text-cocoa/40 transition-colors hover:bg-coral/10 hover:text-coral"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-cocoa/60">
                {formatPrice(item.price)} / unité
              </p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center gap-1 rounded-full border border-espresso/15 bg-cream/60 p-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    aria-label="Diminuer"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-cocoa shadow-sm transition-all hover:bg-espresso hover:text-cream active:scale-95"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-sans text-sm font-bold text-espresso">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    aria-label="Augmenter"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-cocoa shadow-sm transition-all hover:bg-espresso hover:text-cream active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="font-sans text-lg font-bold text-espresso">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Résumé */}
      <aside className="card h-fit p-6 lg:sticky lg:top-24">
        <PromoProgress total={total} />
        <p className="kicker text-coral">Récapitulatif</p>
        <h2 className="mt-1 font-display text-xl font-normal text-espresso">
          Ce que tu embarques
        </h2>
        <dl className="mt-5 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-cocoa/70">Sous-total</dt>
            <dd className="font-semibold text-espresso">{formatPrice(total)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="flex items-center gap-1.5 text-cocoa/70">
              <Truck className="h-4 w-4" /> Livraison
            </dt>
            <dd className="badge-green">Offerte</dd>
          </div>
          <div className="divider-dots my-2" aria-hidden />
          <div className="flex justify-between font-sans text-lg font-bold text-espresso">
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="btn-primary mt-6 w-full py-4">
          Passer commande <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/products"
          className="btn-ghost mt-2 w-full text-center text-sm"
        >
          Continuer à fouiller
        </Link>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-cocoa/60">
          <ShieldCheck className="h-3.5 w-3.5" /> Paiement sécurisé via Stripe
        </p>
      </aside>
      </div>
      <CrossSell exclude={items.map((i) => i.productId)} />
    </>
  );
}

function CrossSell({ exclude }: { exclude: number[] }) {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    fetch(`/api/products/suggestions?exclude=${exclude.join(",")}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]));
  }, [exclude.join(",")]);

  if (!products || products.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="flex items-center gap-2 font-display text-2xl font-normal text-espresso">
        <Sparkles className="h-5 w-5 text-honey" /> Souvent embarqué avec
      </h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-3">
        {products.map((p) => (
          <li
            key={p.id}
            className="card flex items-center gap-3 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-warm"
          >
            <Link
              href={`/products/${p.slug}`}
              className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-deep"
            >
              <ProductImage
                src={p.imageUrl || "/placeholder.svg"}
                alt={p.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${p.slug}`}
                className="block truncate text-sm font-bold text-espresso hover:text-coral"
              >
                {p.name}
              </Link>
              <p className="font-sans text-sm font-bold text-espresso">
                {formatPrice(p.price)}
              </p>
            </div>
            <AddToCartButton
              productId={p.id}
              slug={p.slug}
              name={p.name}
              price={p.price}
              imageUrl={p.imageUrl}
              stock={p.stock}
              className="!w-auto px-4 text-xs"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function PromoProgress({ total }: { total: number }) {
  const [promo, setPromo] = useState<{
    code: string;
    type: string;
    value: number;
    minAmount: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/promo/active")
      .then((r) => r.json())
      .then((d) => setPromo(d.promo ?? null))
      .catch(() => {});
  }, []);

  if (!promo) return null;
  const missing = promo.minAmount - total;
  if (missing <= 0) {
    return (
      <p className="mb-5 flex items-center gap-2 rounded-2xl bg-espresso px-4 py-3 text-sm font-semibold text-cream">
        <BadgePercent className="h-4 w-4 text-honey" />
        {promo.code} déblocable au paiement !
      </p>
    );
  }
  const pct = Math.min(100, Math.round((total / promo.minAmount) * 100));
  return (
    <div className="mb-5 rounded-2xl bg-cream-deep/70 p-4">
      <p className="text-sm text-espresso">
        Plus que <strong className="font-bold">{formatPrice(missing)}</strong>{" "}
        pour débloquer <strong className="font-bold">{promo.code}</strong>
      </p>
      <div
        className="mt-2.5 h-2 overflow-hidden rounded-full bg-espresso/10"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-honey to-coral transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
