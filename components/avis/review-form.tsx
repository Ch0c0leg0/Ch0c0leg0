"use client";

import { useActionState } from "react";
import { CircleAlert, Loader2, PenLine } from "lucide-react";
import { StarsInput } from "@/components/avis/stars-input";
import {
  submitReviewAction,
  type ReviewActionState,
} from "@/components/avis/review-actions";
import type { Review } from "@/lib/reviews";

/** Formulaire d'avis : les erreurs s'affichent sous le formulaire, jamais en pleine page. */
export function ReviewForm({
  productId,
  slug,
  existing,
}: {
  productId: number;
  slug: string;
  existing: Review | null;
}) {
  const [state, action, pending] = useActionState<ReviewActionState, FormData>(
    submitReviewAction,
    { ok: false }
  );

  return (
    <form
      action={action}
      className="card space-y-4 border-espresso/15 p-6 sm:p-8"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <h3 className="flex items-center gap-2 font-display text-xl font-normal text-espresso">
        <PenLine className="h-5 w-5 text-honey" />
        {existing ? "Modifier mon avis" : "Donne ton avis"}
      </h3>
      <div>
        <span className="label">Ta note</span>
        <StarsInput defaultValue={existing?.rating ?? 5} />
      </div>
      <div>
        <label className="label" htmlFor="review-title">
          Titre (optionnel)
        </label>
        <input
          id="review-title"
          name="title"
          maxLength={80}
          defaultValue={existing?.title ?? ""}
          className="input"
          placeholder="Ex : Il a changé mes games"
        />
      </div>
      <div>
        <label className="label" htmlFor="review-body">
          Ton expérience *
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          rows={4}
          maxLength={2000}
          defaultValue={existing?.body ?? ""}
          className="input resize-y"
          placeholder="Confort, précision, bruit, autonomie… Dis-nous tout, le bon comme le moins bon."
        />
      </div>
      {!state.ok && state.error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-medium text-[#b23a20]"
        >
          <CircleAlert className="h-4 w-4 shrink-0" /> {state.error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn-coral">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
            </>
          ) : existing ? (
            "Mettre à jour"
          ) : (
            "Publier mon avis"
          )}
        </button>
        <p className="text-xs font-light text-cocoa/55">
          Relu par l'équipe avant publication. Les avis édités repassent en relecture.
        </p>
      </div>
    </form>
  );
}
