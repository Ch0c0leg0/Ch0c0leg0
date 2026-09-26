"use client";

import Link from "next/link";
import { FileText, Save, ArrowLeft } from "lucide-react";

type SaveAction = (formData: FormData) => Promise<void>;

export type PostFormValue = {
  id?: number;
  slug?: string;
  title?: string;
  excerpt?: string;
  body?: string;
  published?: boolean;
};

export function PostForm({
  post,
  saveAction,
}: {
  post?: PostFormValue | null;
  saveAction: SaveAction;
}) {
  return (
    <form action={saveAction} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {post?.id !== undefined && <input type="hidden" name="id" value={post.id} />}

      <div className="card space-y-4 p-6">
        <h2 className="font-display flex items-center gap-2 text-lg font-normal text-espresso">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
            <FileText className="h-4 w-4" />
          </span>
          Contenu
        </h2>
        <div>
          <label className="label" htmlFor="title">
            Titre *
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={post?.title ?? ""}
            className="input"
            placeholder="Ex : Bien choisir son casque"
          />
        </div>
        <div>
          <label className="label" htmlFor="slug">
            Slug (URL)
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={post?.slug ?? ""}
            className="input"
            placeholder="laisser vide pour générer automatiquement"
          />
        </div>
        <div>
          <label className="label" htmlFor="excerpt">
            Extrait (accroche, 300 signes max)
          </label>
          <input
            id="excerpt"
            name="excerpt"
            defaultValue={post?.excerpt ?? ""}
            className="input"
            maxLength={300}
          />
        </div>
        <div>
          <label className="label" htmlFor="body">
            Corps de l'article
          </label>
          <textarea
            id="body"
            name="body"
            rows={14}
            defaultValue={post?.body ?? ""}
            className="input resize-y"
            placeholder="Conseils courts, sans blabla…"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="card space-y-4 p-6">
          <h2 className="font-display text-lg font-normal text-espresso">Publication</h2>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-cream/60 px-4 py-3 ring-1 ring-espresso/10">
            <span className="text-sm font-semibold text-espresso">
              Article visible sur /guides
            </span>
            <input
              type="checkbox"
              name="published"
              defaultChecked={post?.published ?? true}
              className="h-5 w-5 accent-[#ff6b4a]"
            />
          </label>
          <button type="submit" className="btn-coral w-full py-3">
            <Save className="h-4 w-4" />
            {post?.id !== undefined ? "Enregistrer" : "Créer le guide"}
          </button>
          <Link
            href="/admin/guides"
            className="btn-ghost w-full px-4 py-3 text-center text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>
      </div>
    </form>
  );
}
