import Link from "next/link";
import { MessageSquareOff, Trash2 } from "lucide-react";
import { getMyReviews } from "@/lib/reviews";
import { requireCustomer } from "@/lib/customer";
import { Stars } from "@/components/avis/stars";
import { deleteMyReviewAction } from "@/components/avis/review-actions";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "En relecture",
  approved: "Publié",
  rejected: "Refusé",
};

export default async function MesAvisPage() {
  const user = await requireCustomer();
  const reviews = await getMyReviews(user.id);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-light tracking-tight text-espresso">
          Mes avis
        </h1>
        <p className="mt-1 text-sm font-light text-cocoa/70">
          {reviews.length} avis déposé{reviews.length > 1 ? "s" : ""} — merci
          de prendre le temps, ça aide vraiment les autres joueurs.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <MessageSquareOff className="h-10 w-10 text-espresso/25" />
          <p className="font-display text-xl font-normal text-espresso">
            Aucun avis pour l'instant.
          </p>
          <p className="text-sm font-light text-cocoa/65">
            Teste un produit, reviens ici via sa fiche, raconte.
          </p>
          <Link href="/products" className="btn-primary mt-2">
            Voir la boutique
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    {r.productSlug ? (
                      <Link
                        href={`/products/${r.productSlug}#avis`}
                        className="font-bold text-espresso hover:text-coral hover:underline"
                      >
                        {r.productName}
                      </Link>
                    ) : (
                      <span className="font-bold text-espresso">
                        {r.productName}
                      </span>
                    )}
                    <span
                      className={
                        r.status === "approved"
                          ? "badge-green"
                          : r.status === "rejected"
                            ? "badge-red"
                            : "badge-amber"
                      }
                    >
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </p>
                  <p className="text-xs font-light text-cocoa/55">
                    {formatDate(r.createdAt)}
                  </p>
                </div>
                <Stars value={r.rating} />
              </div>
              {r.title && (
                <p className="mt-2 font-display text-lg font-normal text-espresso">
                  {r.title}
                </p>
              )}
              <p className="mt-1 line-clamp-3 whitespace-pre-line text-[15px] font-light text-cocoa/85">
                {r.body}
              </p>
              <form action={deleteMyReviewAction} className="mt-3">
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="slug" value={r.productSlug} />
                <button type="submit" className="btn-ghost text-xs text-red-600">
                  <Trash2 className="h-4 w-4" /> Retirer mon avis
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
