"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { ProductImage } from "@/components/product-image";

type Img = { id: number; url: string; position: number };

/** Galerie admin repliée par défaut (details) — discrète. */
export function ProductGallery({ productId }: { productId: number }) {
  const [images, setImages] = useState<Img[] | null>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const res = await fetch(`/api/admin/product-images?productId=${productId}`);
      const data = await res.json();
      const rows = Array.isArray(data?.images) ? data.images : [];
      setImages(
        rows.map((r: { id: unknown; url: unknown; position: unknown }) => ({
          id: Number(r.id),
          url: String(r.url ?? ""),
          position: Number(r.position ?? 0),
        }))
      );
    } catch {
      setImages([]);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function add() {
    const clean = url.trim();
    if (!clean) return;
    setBusy(true);
    try {
      await fetch("/api/admin/product-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, url: clean }),
      });
      setUrl("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    await fetch(`/api/admin/product-images?id=${id}`, { method: "DELETE" }).catch(() => {});
    await load();
  }

  return (
    <details className="card p-6">
      <summary className="cursor-pointer font-display text-lg font-normal text-espresso">
        Galerie (images secondaires)
        <span className="ml-2 text-xs font-light text-cocoa/55">
          {images === null ? "" : `— ${images.length} image(s), optionnel`}
        </span>
      </summary>
      <div className="mt-4 flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://… ou /uploads/….png"
          className="input flex-1"
        />
        <button type="button" onClick={add} disabled={busy || !url.trim()} className="btn-outline shrink-0 text-sm">
          <ImagePlus className="h-4 w-4" /> Ajouter
        </button>
      </div>
      {images === null ? (
        <p className="mt-3 text-sm text-cocoa/50">Chargement…</p>
      ) : images.length === 0 ? (
        <p className="mt-3 text-sm text-cocoa/50">
          Aucune image secondaire. La fiche utilise l&apos;image principale.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <li key={img.id} className="group relative overflow-hidden rounded-2xl border border-espresso/10 bg-cream-deep">
              <div className="relative aspect-square">
                <ProductImage src={img.url} alt="" fill sizes="120px" className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => remove(img.id)}
                aria-label="Supprimer cette image"
                className="absolute right-1.5 top-1.5 rounded-full bg-night/60 p-1.5 text-cream opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
