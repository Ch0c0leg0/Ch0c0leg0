import Link from "next/link";
import { Check, Trash2, X } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  approveReviewAction,
  deleteReviewAction,
  rejectReviewAction,
  replyReviewAction,
} from "@/app/admin/actions";
import { Stars } from "@/components/avis/stars";
import { RefreshButton } from "@/components/admin/refresh-button";
import { formatDate } from "@/lib/format";
import type { ReviewRow } from "@/lib/reviews";

export const dynamic = "force-dynamic";

type AdminReview = ReviewRow & {
  products: { name: string; slug: string } | null;
};

export default async function AdminAvisPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>;
}) {
  const sp = await searchParams;
  const filtre = sp.filtre === "tous" ? "tous" : "attente";

  const admin = createAdminClient();
  let query = admin
    .from("reviews")
    .select("*, products(name,slug)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (filtre === "attente") query = query.eq("status", "pending");
  const { data } = await query;
  const reviews = (
    Array.isArray(data) ? (data as unknown as AdminReview[]) : []
  );

  const statusLabel: Record<string, string> = {
    pending: "En attente",
    approved: "Publié",
    rejected: "Refusé",
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-light tracking-tight text-espresso">
            Avis clients
          </h1>
          <p className="mt-1 text-sm font-light text-cocoa/70">
            Relis chaque avis avant publication. Les avis validés apparaissent
            sous le bon produit, au nom de la bonne personne.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <Link
            href="/admin/avis"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filtre === "attente"
                ? "bg-espresso text-cream"
                : "bg-white text-cocoa hover:bg-cream-deep"
            }`}
          >
            En attente
          </Link>
          <Link
            href="/admin/avis?filtre=tous"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filtre === "tous"
                ? "bg-espresso text-cream"
                : "bg-white text-cocoa hover:bg-cream-deep"
            }`}
          >
            Tous
          </Link>
        </div>
      </header>

      {reviews.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-display text-xl font-normal text-espresso">
            {filtre === "attente" ? "File vide. Respire." : "Aucun avis pour le moment."}
          </p>
          <p className="mt-1 text-sm font-light text-cocoa/65">
            {filtre === "attente"
              ? "Tout est relu. Les nouveaux avis arrivent ici."
              : "Les avis déposés depuis les fiches produits arrivent ici."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={Number(r.id)} className="card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-deep font-display text-lg text-espresso">
                  {String(r.display_name ?? "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-bold text-espresso">
                      {String(r.display_name ?? "Anonyme")}
                    </span>
                    <span
                      className={
                        r.status === "approved"
                          ? "badge-green"
                          : r.status === "rejected"
                            ? "badge-red"
                            : "badge-amber"
                      }
                    >
                      {statusLabel[String(r.status)] ?? String(r.status)}
                    </span>
                  </p>
                  <p className="text-xs font-light text-cocoa/55">
                    {r.products ? (
                      <Link
                        href={`/products/${r.products.slug}`}
                        className="hover:text-coral hover:underline"
                      >
                        {r.products.name}
                      </Link>
                    ) : (
                      "Produit retiré"
                    )}{" "}
                    · {formatDate(Number(r.created_at ?? 0))}
                  </p>
                </div>
                <Stars value={Number(r.rating ?? 5)} />
              </div>
              {r.title && (
                <p className="mt-3 font-display text-lg font-normal text-espresso">
                  {String(r.title)}
                </p>
              )}
              <p className="mt-1 whitespace-pre-line text-[15px] font-light leading-relaxed text-cocoa/85">
                {String(r.body ?? "")}
              </p>
              <form action={replyReviewAction} className="mt-3 flex gap-2">
                <input type="hidden" name="id" value={Number(r.id)} />
                <input
                  name="reply"
                  defaultValue={String((r as { merchant_reply?: unknown }).merchant_reply ?? "")}
                  placeholder="Réponse boutique (1 ligne, optionnel)…"
                  className="input flex-1 py-2 text-sm"
                  maxLength={1000}
                />
                <button type="submit" className="btn-ghost shrink-0 text-xs">
                  Répondre
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-espresso/10 pt-4">
                {String(r.status) !== "approved" && (
                  <form action={approveReviewAction}>
                    <input type="hidden" name="id" value={Number(r.id)} />
                    <button type="submit" className="btn-primary text-xs">
                      <Check className="h-4 w-4" /> Publier
                    </button>
                  </form>
                )}
                {String(r.status) === "pending" && (
                  <form action={rejectReviewAction}>
                    <input type="hidden" name="id" value={Number(r.id)} />
                    <button type="submit" className="btn-outline text-xs">
                      <X className="h-4 w-4" /> Refuser
                    </button>
                  </form>
                )}
                <form action={deleteReviewAction} className="ml-auto">
                  <input type="hidden" name="id" value={Number(r.id)} />
                  <button
                    type="submit"
                    className="btn-ghost text-xs text-red-600"
                  >
                    <Trash2 className="h-4 w-4" /> Supprimer
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
