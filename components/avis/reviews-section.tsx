import Link from "next/link";
import { BadgeCheck, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getApprovedReviews,
  getMyReviewForProduct,
  type Review,
} from "@/lib/reviews";
import { Stars } from "@/components/avis/stars";
import { HelpfulButton } from "@/components/avis/helpful-button";
import { ReviewForm } from "@/components/avis/review-form";
import { GsapReveal } from "@/components/motion/gsap-reveal";
import { deleteMyReviewAction } from "@/components/avis/review-actions";
import { formatDate } from "@/lib/format";

export async function ReviewsSection({
  productId,
  slug,
}: {
  productId: number;
  slug: string;
}) {
  const supabase = await createClient().catch(() => null);
  let userId: string | null = null;
  try {
    const { data } = await supabase!.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null;
  }

  const [reviews, myReview] = await Promise.all([
    getApprovedReviews(productId, userId),
    userId ? getMyReviewForProduct(productId, userId) : null,
  ]);

  // Mon avis déjà publié : ne pas le dupliquer dans la liste.
  const others = myReview
    ? reviews.filter((r) => r.userId !== myReview.userId)
    : reviews;

  const count = reviews.length;
  const average = count
    ? reviews.reduce((s, r) => s + r.rating, 0) / count
    : 0;
  const histogram = [5, 4, 3, 2, 1].map((star) => ({
    star,
    n: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <section id="avis" className="mt-16 scroll-mt-24">
      <GsapReveal>
        <p className="kicker text-cocoa/60">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-honey" />
          Ils en parlent
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <h2 className="font-display text-3xl font-normal tracking-tight text-espresso md:text-4xl">
            {count === 0 ? "Pas encore d'avis" : `${count} avis`}
          </h2>
          {count > 0 && (
            <span className="flex items-center gap-2">
              <Stars value={average} starClass="h-5 w-5" />
              <span className="font-sans text-lg font-bold text-espresso">
                {average.toFixed(1)}
              </span>
              <span className="text-sm font-light text-cocoa/60">/ 5</span>
            </span>
          )}
        </div>
        {count > 0 && (
          <details className="mt-4 max-w-md rounded-2xl border border-espresso/10 bg-white/60 px-4 py-3 text-sm">
            <summary className="cursor-pointer font-medium text-espresso">
              Détail des notes
            </summary>
            <ul className="mt-3 space-y-1.5">
              {histogram.map((h) => (
                <li key={h.star} className="flex items-center gap-2 text-xs text-cocoa/70">
                  <span className="w-6 font-bold">{h.star}★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-espresso/10">
                    <span
                      className="block h-full rounded-full bg-honey"
                      style={{ width: `${count ? Math.round((h.n / count) * 100) : 0}%` }}
                    />
                  </span>
                  <span className="w-8 text-right">{h.n}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </GsapReveal>

      {/* Liste */}
      {others.length > 0 && (
        <ul className="mt-8 space-y-4">
          {others.map((r, i) => (
            <GsapReveal key={r.id} delay={Math.min(i * 0.05, 0.2)}>
              <ReviewCard review={r} />
            </GsapReveal>
          ))}
        </ul>
      )}

      {/* Mon état */}
      <div className="mt-8">
        {!userId ? (
          <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
            <p className="text-sm font-light text-cocoa/80">
              Tu as ce produit ? <strong className="font-bold">Connecte-toi</strong> pour
              raconter ton expérience.
            </p>
            <div className="flex gap-2">
              <Link href="/connexion" className="btn-primary">
                Se connecter
              </Link>
              <Link href="/inscription" className="btn-outline">
                Créer un compte
              </Link>
            </div>
          </div>
        ) : myReview && myReview.status === "pending" ? (
          <div className="card flex flex-wrap items-center justify-between gap-4 border-honey/40 bg-honey/10 p-6">
            <p className="text-sm text-espresso">
              Ton avis est <strong>en cours de lecture</strong> par l'équipe.
              Il apparaîtra ici dès qu'il sera validé.
            </p>
            <form action={deleteMyReviewAction}>
              <input type="hidden" name="id" value={myReview.id} />
              <input type="hidden" name="slug" value={slug} />
              <button type="submit" className="btn-ghost text-xs text-red-600">
                <Trash2 className="h-4 w-4" /> Retirer
              </button>
            </form>
          </div>
        ) : (
          <ReviewForm
            productId={productId}
            slug={slug}
            existing={myReview}
          />
        )}
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <li className="card p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-deep font-display text-lg text-espresso">
          {review.displayName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold text-espresso">{review.displayName}</span>
            {review.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-espresso/8 px-2 py-0.5 text-[11px] font-medium text-espresso">
                <BadgeCheck className="h-3 w-3" /> Achat vérifié
              </span>
            )}
          </p>
          <p className="text-xs font-light text-cocoa/55">
            {formatDate(review.createdAt)}
          </p>
        </div>
        <Stars value={review.rating} />
      </div>
      {review.title && (
        <p className="mt-3 font-display text-lg font-normal text-espresso">
          {review.title}
        </p>
      )}
      <p className="mt-1.5 whitespace-pre-line text-[15px] font-light leading-relaxed text-cocoa/85">
        {review.body}
      </p>
      {review.merchantReply && (
        <p className="mt-3 rounded-2xl bg-cream-deep/70 px-4 py-3 text-sm italic text-cocoa/80">
          <span className="font-bold not-italic text-espresso">Réponse boutique — </span>
          {review.merchantReply}
        </p>
      )}
      <div className="mt-3">
        <HelpfulButton reviewId={review.id} initialCount={review.helpfulCount} />
      </div>
    </li>
  );
}
