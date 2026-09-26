"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/session";
import { slugify } from "@/lib/format";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

function parseMoney(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const raw = String(value).trim().replace(/\s/g, "");
  if (!raw) return null;
  const normalized = raw.replace(",", ".");
  const n = Number.parseFloat(normalized);
  if (Number.isNaN(n) || n < 0) throw new Error("Montant invalide");
  return Math.round(n * 100);
}

function parseIntParam(value: FormDataEntryValue | null, fallback = 0): number {
  if (value === null) return fallback;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Log + message précis : ne plus jamais masquer l'erreur Supabase. */
function throwSupabase(
  context: string,
  error: { message: string; code?: string; details?: string } | null
): never {
  console.error(`[admin] ${context} :`, error);
  const detail = error?.message ?? "réponse vide";
  const code = error?.code ? ` (${error.code})` : "";
  throw new Error(`Échec Supabase${code} : ${detail}`);
}

async function uniqueProductSlug(base: string, excludeId?: number): Promise<string> {
  const admin = createAdminClient();
  const slug = slugify(base) || `produit-${Date.now()}`;
  let candidate = slug;
  let counter = 1;
  while (true) {
    const { data } = await admin
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    const existingId = Number(
      (data as unknown as { id?: unknown } | null)?.id ?? NaN
    );
    if (!data || existingId === excludeId) return candidate;
    candidate = `${slug}-${counter++}`;
  }
}

/* ============ Déconnexion ============ */

export async function logoutAction() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

/* ============ Produits ============ */

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Le nom du produit est requis.");

  const slug = await uniqueProductSlug(
    String(formData.get("slug") ?? "").trim() || name
  );
  const price = parseMoney(formData.get("price"));
  const compareAtPrice = parseMoney(formData.get("compareAtPrice"));

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .insert({
      name,
      slug,
      description: String(formData.get("description") ?? "").trim(),
      price: price ?? 0,
      compare_at_price: compareAtPrice,
      stock: parseIntParam(formData.get("stock")),
      image_url: String(formData.get("imageUrl") ?? "").trim(),
      active: formData.get("active") === "on",
      featured: formData.get("featured") === "on",
      category_id: parseIntParam(formData.get("categoryId"), 0) || null,
      updated_at: Date.now(),
    })
    .select("id")
    .single();
  if (error || !data) throwSupabase("création produit", error);
  const id = Number((data as unknown as { id: number }).id);
  const createdPrice = price ?? 0;

  // Lettre aux abonnés AVANT la redirection : after() est annulé par
  // redirect(), l'envoi doit donc être attendu ici (jamais bloquant en erreur).
  try {
    const { notifyNewProduct } = await import("@/lib/email");
    await notifyNewProduct({ name, price: createdPrice, slug });
  } catch (e) {
    console.error("[email] nouveau produit :", e);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect(`/admin/products/${id}/edit`);
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const id = parseIntParam(formData.get("id"));
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("products")
    .select("price,stock")
    .eq("id", id)
    .maybeSingle();
  if (!existing) throw new Error("Produit introuvable.");
  const prev = existing as unknown as { price: number; stock: number };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Le nom du produit est requis.");

  const slug = await uniqueProductSlug(
    String(formData.get("slug") ?? "").trim() || name,
    id
  );
  const price = parseMoney(formData.get("price"));

  const { error: updateError } = await admin
    .from("products")
    .update({
      name,
      slug,
      description: String(formData.get("description") ?? "").trim(),
      price: price ?? prev.price,
      compare_at_price: parseMoney(formData.get("compareAtPrice")),
      stock: parseIntParam(formData.get("stock"), prev.stock),
      image_url: String(formData.get("imageUrl") ?? "").trim(),
      active: formData.get("active") === "on",
      featured: formData.get("featured") === "on",
      category_id: parseIntParam(formData.get("categoryId"), 0) || null,
      updated_at: Date.now(),
    })
    .eq("id", id);
  if (updateError) throwSupabase("modification produit", updateError);

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
  redirect(`/admin/products/${id}/edit`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  await createAdminClient().from("products").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function toggleActiveAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const admin = createAdminClient();
  const { data } = await admin
    .from("products")
    .select("active")
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const active = Boolean((data as unknown as { active: boolean }).active);
  await admin
    .from("products")
    .update({ active: !active, updated_at: Date.now() })
    .eq("id", id);
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
}

/* ============ Catégories ============ */

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Le nom de la catégorie est requis.");
  const admin = createAdminClient();
  let slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const { data: existing } = await admin
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }
  const icon = String(formData.get("icon") ?? "").trim() || "Gamepad2";
  const { error: catError } = await admin.from("categories").insert({ name, slug, icon });
  if (catError) throwSupabase("création catégorie", catError);
  try {
    const { notifyNewCategory } = await import("@/lib/email");
    await notifyNewCategory({ name, slug });
  } catch (e) {
    console.error("[email] nouvelle catégorie :", e);
  }
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("categories")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!existing) throw new Error("Catégorie introuvable.");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Le nom de la catégorie est requis.");
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const icon = String(formData.get("icon") ?? "").trim() || "Gamepad2";
  await admin.from("categories").update({ name, slug, icon }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  await createAdminClient().from("categories").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

/* ============ Commandes ============ */

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const allowed = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "returned", "refunded"];
  if (!allowed.includes(status)) throw new Error("Statut invalide.");
  const tracking = String(formData.get("trackingNumber") ?? "").trim().slice(0, 80);
  const carrier = String(formData.get("carrier") ?? "").trim().slice(0, 30) || undefined;
  const admin = createAdminClient();
  // Tolérant si migration non jouée (tracking/carrier absents).
  const payload: Record<string, unknown> = { status, updated_at: Date.now() };
  if (tracking) payload.tracking_number = tracking;
  if (carrier) payload.carrier = carrier;
  let { error } = await admin.from("orders").update(payload).eq("id", id);
  if (error && (tracking || carrier)) {
    const retry = await admin.from("orders").update({ status, updated_at: Date.now() }).eq("id", id);
    error = retry.error;
  }
  if (error) throwSupabase("modification commande", error);
  // E-mails discrets en arrière-plan.
  const { data: orderRow } = await admin.from("orders").select("customer_email").eq("id", id).maybeSingle();
  const email = String((orderRow as unknown as { customer_email?: unknown } | null)?.customer_email ?? "");
  if (email.includes("@")) {
    try {
      const { sendOrderShipped, sendOrderRefunded } = await import("@/lib/email");
      if (status === "shipped" || status === "delivered") {
        await sendOrderShipped({ to: email, orderId: id, tracking: tracking || undefined });
      } else if (status === "refunded" || status === "returned") {
        await sendOrderRefunded({ to: email, orderId: id });
      }
    } catch (e) {
      console.error("[email] statut commande :", e);
    }
  }
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  redirect(`/admin/orders/${id}`);
}

export async function refundOrderAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("stripe_payment_intent_id,customer_email")
    .eq("id", id)
    .maybeSingle();
  const intent = (data as unknown as { stripe_payment_intent_id?: unknown } | null)?.stripe_payment_intent_id;
  const email = String((data as unknown as { customer_email?: unknown } | null)?.customer_email ?? "");
  if (typeof intent === "string" && intent) {
    try {
      const { getStripe } = await import("@/lib/stripe");
      const stripe = getStripe();
      if (stripe) await stripe.refunds.create({ payment_intent: intent });
    } catch (e) {
      console.error("[admin] remboursement Stripe :", e);
      throw new Error("Remboursement Stripe impossible (vérifie le payment_intent).");
    }
  }
  await admin.from("orders").update({ status: "refunded", updated_at: Date.now() }).eq("id", id);
  if (email.includes("@")) {
    try {
      const { sendOrderRefunded } = await import("@/lib/email");
      await sendOrderRefunded({ to: email, orderId: id });
    } catch (e) {
      console.error("[email] remboursement :", e);
    }
  }
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  redirect(`/admin/orders/${id}`);
}

/* ============ Codes promo ============ */

export async function createPromoAction(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) throw new Error("Le code est requis.");
  const type = formData.get("type") === "amount" ? "amount" : "percent";
  const rawValue = String(formData.get("value") ?? "").trim().replace(",", ".");
  const value =
    type === "percent"
      ? Math.round(Number(rawValue))
      : Math.round(Number(rawValue) * 100);
  if (!Number.isFinite(value) || value <= 0) throw new Error("Valeur invalide.");
  if (type === "percent" && value > 100) throw new Error("Maximum 100 % pour un pourcentage.");
  const minAmountRaw = String(formData.get("minAmount") ?? "").trim().replace(",", ".");
  const minAmount = minAmountRaw ? Math.round(Number(minAmountRaw) * 100) : 0;
  const expiresAtRaw = String(formData.get("expiresAt") ?? "").trim();
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw).getTime() : null;
  const usageLimitRaw = String(formData.get("usageLimit") ?? "").trim();
  const usageLimit = usageLimitRaw ? Math.max(1, parseInt(usageLimitRaw, 10)) : null;

  const { error } = await createAdminClient().from("promo_codes").insert({
    code,
    type,
    value,
    min_amount: minAmount,
    active: formData.get("active") === "on",
    expires_at: expiresAt,
    usage_limit: usageLimit,
  });
  if (error) throwSupabase("création code promo", error);
  const promoLabel =
    type === "percent" ? `−${value} %` : `−${(value / 100).toFixed(2).replace(".", ",")} €`;
  try {
    const { notifyNewPromo } = await import("@/lib/email");
    await notifyNewPromo({ code, label: promoLabel });
  } catch (e) {
    console.error("[email] nouveau code :", e);
  }
  revalidatePath("/admin/promos");
  redirect("/admin/promos");
}

export async function deletePromoAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  await createAdminClient().from("promo_codes").delete().eq("id", id);
  revalidatePath("/admin/promos");
  redirect("/admin/promos");
}

/* ============ Avis clients ============ */

export async function approveReviewAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const { error } = await createAdminClient()
    .from("reviews")
    .update({ status: "approved", updated_at: Date.now() })
    .eq("id", id);
  if (error) throwSupabase("validation avis", error);
  revalidatePath("/admin/avis");
  revalidatePath("/");
  redirect("/admin/avis");
}

export async function rejectReviewAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const { error } = await createAdminClient()
    .from("reviews")
    .update({ status: "rejected", updated_at: Date.now() })
    .eq("id", id);
  if (error) throwSupabase("refus avis", error);
  revalidatePath("/admin/avis");
  redirect("/admin/avis");
}

export async function deleteReviewAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const { error } = await createAdminClient()
    .from("reviews")
    .delete()
    .eq("id", id);
  if (error) throwSupabase("suppression avis", error);
  revalidatePath("/admin/avis");
  revalidatePath("/");
  redirect("/admin/avis");
}

export async function replyReviewAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const reply = String(formData.get("reply") ?? "").trim().slice(0, 1000);
  try {
    const { error } = await createAdminClient()
      .from("reviews")
      .update({ merchant_reply: reply, updated_at: Date.now() })
      .eq("id", id);
    if (error) throw error;
  } catch (e) {
    console.error("[admin] réponse avis :", e);
    throw new Error("Réponse impossible (joue la migration : reviews.merchant_reply).");
  }
  revalidatePath("/admin/avis");
  revalidatePath("/");
  redirect("/admin/avis");
}

/* ============ Newsletter & messages ============ */

export async function deleteSubscriberAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  await createAdminClient().from("newsletter_subscribers").delete().eq("id", id);
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter");
}

/** Envoie un e-mail de test (vérifie la délivrabilité Brevo). */
export async function sendTestEmailAction() {
  await requireAdmin();
  const { sendTestEmail } = await import("@/lib/email");
  await sendTestEmail();
  revalidatePath("/admin/newsletter");
}

export async function markMessageReadAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  await createAdminClient()
    .from("contact_messages")
    .update({ read: true })
    .eq("id", id);
  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  await createAdminClient().from("contact_messages").delete().eq("id", id);
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}

export async function togglePromoAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const admin = createAdminClient();
  const { data } = await admin
    .from("promo_codes")
    .select("active")
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const active = Boolean((data as unknown as { active: boolean }).active);
  await admin.from("promo_codes").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/promos");
}

/* ============ Tarifs livraison ============ */

const SHIPPING_ZONES = ["FR", "BE", "CH", "LU", "CA"];

export async function createShippingRateAction(formData: FormData) {
  await requireAdmin();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) throw new Error("Le libellé est requis.");
  const zone = SHIPPING_ZONES.includes(String(formData.get("zone") ?? "").toUpperCase())
    ? String(formData.get("zone") ?? "FR").toUpperCase()
    : "FR";
  const price = parseMoney(formData.get("price")) ?? 0;
  const minAmount = parseMoney(formData.get("minAmount")) ?? 0;
  const { error } = await createAdminClient().from("shipping_rates").insert({
    zone,
    label,
    price,
    min_amount: minAmount,
    active: formData.get("active") === "on",
  });
  if (error) throwSupabase("création tarif livraison", error);
  revalidatePath("/checkout");
  revalidatePath("/livraison-retours");
  revalidatePath("/admin/livraison");
  redirect("/admin/livraison");
}

export async function updateShippingRateAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const label = String(formData.get("label") ?? "").trim();
  if (!label) throw new Error("Le libellé est requis.");
  const zone = SHIPPING_ZONES.includes(String(formData.get("zone") ?? "").toUpperCase())
    ? String(formData.get("zone") ?? "FR").toUpperCase()
    : "FR";
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("shipping_rates")
    .select("price,min_amount")
    .eq("id", id)
    .maybeSingle();
  if (!existing) throw new Error("Tarif introuvable.");
  const prev = existing as unknown as { price: number; min_amount: number };
  const price = parseMoney(formData.get("price"));
  const minAmount = parseMoney(formData.get("minAmount"));
  const { error } = await admin
    .from("shipping_rates")
    .update({
      label,
      zone,
      price: price ?? prev.price,
      min_amount: minAmount ?? prev.min_amount,
      active: formData.get("active") === "on",
    })
    .eq("id", id);
  if (error) throwSupabase("modification tarif livraison", error);
  revalidatePath("/checkout");
  revalidatePath("/livraison-retours");
  revalidatePath("/admin/livraison");
  redirect("/admin/livraison");
}

export async function deleteShippingRateAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  await createAdminClient().from("shipping_rates").delete().eq("id", id);
  revalidatePath("/checkout");
  revalidatePath("/livraison-retours");
  revalidatePath("/admin/livraison");
  redirect("/admin/livraison");
}

export async function toggleShippingRateAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const admin = createAdminClient();
  const { data } = await admin
    .from("shipping_rates")
    .select("active")
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const active = Boolean((data as unknown as { active: boolean }).active);
  await admin.from("shipping_rates").update({ active: !active }).eq("id", id);
  revalidatePath("/checkout");
  revalidatePath("/livraison-retours");
  revalidatePath("/admin/livraison");
}

/* ============ Guides (posts) ============ */

async function uniquePostSlug(base: string, excludeId?: number): Promise<string> {
  const admin = createAdminClient();
  const slug = slugify(base) || `guide-${Date.now()}`;
  let candidate = slug;
  let counter = 1;
  while (true) {
    const { data } = await admin
      .from("posts")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    const existingId = Number(
      (data as unknown as { id?: unknown } | null)?.id ?? NaN
    );
    if (!data || existingId === excludeId) return candidate;
    candidate = `${slug}-${counter++}`;
  }
}

export async function createPostAction(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Le titre est requis.");
  const slug = await uniquePostSlug(String(formData.get("slug") ?? "").trim() || title);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("posts")
    .insert({
      slug,
      title,
      excerpt: String(formData.get("excerpt") ?? "").trim().slice(0, 300),
      body: String(formData.get("body") ?? "").trim(),
      published: formData.get("published") === "on",
      created_at: Date.now(),
    })
    .select("id")
    .single();
  if (error || !data) throwSupabase("création guide", error);
  const id = Number((data as unknown as { id: number }).id);
  revalidatePath("/guides");
  revalidatePath("/admin/guides");
  redirect(`/admin/guides/${id}/edit`);
}

export async function updatePostAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Le titre est requis.");
  const slug = await uniquePostSlug(String(formData.get("slug") ?? "").trim() || title, id);
  const { error } = await createAdminClient()
    .from("posts")
    .update({
      slug,
      title,
      excerpt: String(formData.get("excerpt") ?? "").trim().slice(0, 300),
      body: String(formData.get("body") ?? "").trim(),
      published: formData.get("published") === "on",
    })
    .eq("id", id);
  if (error) throwSupabase("modification guide", error);
  revalidatePath("/guides");
  revalidatePath(`/guides/${slug}`);
  revalidatePath("/admin/guides");
  redirect(`/admin/guides/${id}/edit`);
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  await createAdminClient().from("posts").delete().eq("id", id);
  revalidatePath("/guides");
  revalidatePath("/admin/guides");
  redirect("/admin/guides");
}

export async function togglePostPublishedAction(formData: FormData) {
  await requireAdmin();
  const id = parseIntParam(formData.get("id"));
  const admin = createAdminClient();
  const { data } = await admin
    .from("posts")
    .select("published")
    .eq("id", id)
    .maybeSingle();
  if (!data) return;
  const published = Boolean((data as unknown as { published: boolean }).published);
  await admin.from("posts").update({ published: !published }).eq("id", id);
  revalidatePath("/guides");
  revalidatePath("/admin/guides");
}
