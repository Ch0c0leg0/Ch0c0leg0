"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCustomer } from "@/lib/customer";

export type ReviewActionState = { ok: boolean; error?: string };

function parseRating(value: FormDataEntryValue | null): number | null {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return n;
}

/**
 * Dépose ou met à jour mon avis (repasse en modération après édition).
 * Les erreurs de validation sont RENVOYÉES (affichage inline via
 * useActionState), jamais jetées en pleine page.
 */
export async function submitReviewAction(
  _prev: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  const user = await requireCustomer();
  const productId = Number(formData.get("productId"));
  if (!Number.isFinite(productId)) {
    return { ok: false, error: "Produit invalide. Recharge la page." };
  }
  const rating = parseRating(formData.get("rating"));
  if (rating === null) {
    return { ok: false, error: "Choisis une note entre 1 et 5 étoiles." };
  }
  const title = String(formData.get("title") ?? "").trim().slice(0, 80);
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  if (!body) {
    return { ok: false, error: "Raconte-nous ton expérience en quelques mots." };
  }
  if (body.length < 10) {
    return { ok: false, error: "Un peu plus de détails (10 caractères min)." };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("display_name,email")
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as unknown as {
    display_name?: string;
    email?: string;
  } | null;
  const displayName =
    String(p?.display_name ?? "").trim() ||
    (user.email ?? "").split("@")[0] ||
    "Joueur anonyme";

  const { data: existing } = await admin
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("reviews")
      .update({
        rating,
        title,
        body,
        status: "pending",
        updated_at: Date.now(),
      })
      .eq(
        "id",
        Number((existing as unknown as { id: number }).id)
      );
    if (error) {
      console.error("[avis] update :", error.message);
      return { ok: false, error: "Enregistrement impossible. Réessaie." };
    }
  } else {
    const { error } = await admin.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      display_name: displayName,
      rating,
      title,
      body,
      status: "pending",
    });
    if (error) {
      console.error("[avis] insert :", error.message);
      return { ok: false, error: "Enregistrement impossible. Réessaie." };
    }
  }

  revalidatePath(`/products/[slug]`, "page");
  revalidatePath("/");
  redirect(`/products/${String(formData.get("slug") ?? "")}?avis=envoye#avis`);
}

/** Retire mon avis. */
export async function deleteMyReviewAction(formData: FormData) {
  const user = await requireCustomer();
  const id = Number(formData.get("id"));
  const slug = String(formData.get("slug") ?? "");
  if (!Number.isFinite(id)) throw new Error("Avis invalide.");
  await createAdminClient()
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath(`/products/[slug]`, "page");
  revalidatePath("/");
  revalidatePath("/compte/avis");
  redirect(slug ? `/products/${slug}#avis` : "/compte/avis");
}
