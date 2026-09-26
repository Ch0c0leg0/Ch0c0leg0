"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, TriangleAlert } from "lucide-react";
import { isNextImageSafe } from "@/lib/images";

export function ImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file?: File | null) {
    if (!file) return;
    setError("");
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload échoué");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload échoué");
    } finally {
      setUploading(false);
    }
  }

  const previewOk = value ? isNextImageSafe(value) : false;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex aspect-[4/5] w-32 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-cream-deep/50 transition-colors ${
            dragOver ? "border-espresso bg-cream-deep" : "border-espresso/20"
          }`}
        >
          {value && previewOk ? (
            <Image
              src={value}
              alt="Aperçu"
              width={128}
              height={160}
              className="h-full w-full object-cover"
            />
          ) : value && !previewOk ? (
            <span className="flex flex-col items-center gap-1.5 px-3 text-center text-xs text-[#b23a20]">
              <TriangleAlert className="h-5 w-5" />
              URL non affichable
            </span>
          ) : (
            <span className="flex flex-col items-center gap-1.5 px-3 text-center text-xs text-cocoa/50">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
              {uploading ? "Envoi…" : "Image du produit"}
            </span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <label className="btn-outline cursor-pointer">
            {uploading ? "Envoi en cours…" : "Choisir un fichier"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
          <p className="text-xs text-cocoa/50">
            JPG, PNG, WebP ou GIF — 5 Mo max. Collez l'URL <strong>directe</strong> de
            l'image (clic droit → « Copier l'adresse de l'image »), pas une page Google.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="…ou collez une URL d'image"
              value={value.startsWith("http") ? value : ""}
              className="input text-sm"
              onChange={(e) => onChange(e.target.value)}
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="btn-ghost shrink-0 text-xs"
              >
                Retirer
              </button>
            )}
          </div>
          <input type="hidden" name="imageUrl" value={value} />
        </div>
      </div>
      {error && (
        <p className="rounded-xl bg-coral/10 px-3 py-2 text-xs font-medium text-[#b23a20]">
          {error}
        </p>
      )}
    </div>
  );
}