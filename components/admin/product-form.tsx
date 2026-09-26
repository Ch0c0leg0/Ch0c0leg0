"use client";

import { useState } from "react";
import Link from "next/link";
import { Info, Banknote, Eye, ImageIcon, Save, ArrowLeft } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { Product } from "@/lib/supabase/types";

type SaveAction = (formData: FormData) => Promise<void>;

export function ProductForm({
  product,
  categories,
  saveAction,
}: {
  product?: Product | null;
  categories: { id: number; name: string }[];
  saveAction: SaveAction;
}) {
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");

  return (
    <form action={saveAction} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-6">
        <div className="card space-y-4 p-6">
          <h2 className="font-display flex items-center gap-2 text-lg font-normal text-espresso">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
              <Info className="h-4 w-4" />
            </span>
            Informations
          </h2>
          <div>
            <label className="label" htmlFor="name">
              Nom *
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={product?.name}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="slug">
              Slug (URL)
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              className="input"
              placeholder="laisser vide pour générer automatiquement"
            />
          </div>
          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={product?.description ?? ""}
              className="input resize-y"
            />
          </div>
          <div>
            <label className="label" htmlFor="categoryId">
              Catégorie
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product?.categoryId ?? ""}
              className="input"
            >
              <option value="">— Sans catégorie —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="font-display flex items-center gap-2 text-lg font-normal text-espresso">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-honey/20 text-espresso">
              <Banknote className="h-4 w-4" />
            </span>
            Prix &amp; stock
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="price">
                Prix (€) *
              </label>
              <input
                id="price"
                name="price"
                required
                type="text"
                inputMode="decimal"
                defaultValue={
                  product ? (product.price / 100).toFixed(2).replace(".", ",") : ""
                }
                className="input"
                placeholder="49,90"
              />
            </div>
            <div>
              <label className="label" htmlFor="compareAtPrice">
                Ancien prix (€)
              </label>
              <input
                id="compareAtPrice"
                name="compareAtPrice"
                type="text"
                inputMode="decimal"
                defaultValue={
                  product?.compareAtPrice
                    ? (product.compareAtPrice / 100).toFixed(2).replace(".", ",")
                    : ""
                }
                className="input"
                placeholder="59,90"
              />
            </div>
            <div>
              <label className="label" htmlFor="stock">
                Stock *
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min={0}
                defaultValue={product?.stock ?? 0}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card space-y-4 p-6">
          <h2 className="font-display flex items-center gap-2 text-lg font-normal text-espresso">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
              <Eye className="h-4 w-4" />
            </span>
            Visibilité
          </h2>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-cream/60 px-4 py-3 ring-1 ring-espresso/10">
              <span className="text-sm font-semibold text-espresso">
                Produit visible en boutique
              </span>
              <span className="relative inline-flex shrink-0">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={product?.active ?? true}
                  className="peer sr-only"
                />
                <span className="block h-6 w-11 rounded-full bg-espresso/15 transition-colors peer-checked:bg-espresso" />
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-cream/60 px-4 py-3 ring-1 ring-espresso/10">
              <span className="text-sm font-semibold text-espresso">
                Mettre en avant sur l’accueil
              </span>
              <span className="relative inline-flex shrink-0">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={product?.featured ?? false}
                  className="peer sr-only"
                />
                <span className="block h-6 w-11 rounded-full bg-espresso/15 transition-colors peer-checked:bg-espresso" />
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          </div>
        </div>

        <div className="card space-y-4 p-6">
          <h2 className="font-display flex items-center gap-2 text-lg font-normal text-espresso">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
              <ImageIcon className="h-4 w-4" />
            </span>
            Image
          </h2>
          <ImageUploader value={imageUrl} onChange={setImageUrl} />
        </div>

        <div className="card space-y-3 p-6">
          <h2 className="font-display text-lg font-normal text-espresso">Actions</h2>
          <button type="submit" className="btn-coral w-full py-3">
            <Save className="h-4 w-4" />
            {product ? "Enregistrer les modifications" : "Créer le produit"}
          </button>
          <Link
            href="/admin/products"
            className="btn-ghost w-full px-4 py-3 text-center text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>
      </div>
    </form>
  );
}
