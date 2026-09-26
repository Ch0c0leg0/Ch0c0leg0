import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

function brevoKey(): string | null {
  const key = (process.env.BREVO_API_KEY ?? "").trim();
  if (!key || key.includes("xxx")) return null;
  return key;
}

export function emailConfigured(): boolean {
  return brevoKey() !== null;
}

function from(): { name: string; email: string } {
  const raw = (process.env.BREVO_FROM ?? "Ch0c0leg0 <onboarding@brevo.com>").trim();
  const name = (process.env.BREVO_FROM_NAME ?? "Ch0c0leg0").trim();
  const match = raw.match(/^(.+?)<([^>]+)>/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name, email: raw };
}

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

/* ---------- Désinscription signée (sans compte) ---------- */

function hmacSecret(): string {
  return process.env.AUTH_SECRET || "dev-only-secret-change-me";
}

export function signUnsubscribe(email: string): string {
  const normalized = email.trim().toLowerCase();
  const payload = Buffer.from(normalized, "utf8").toString("base64url");
  const sig = createHmac("sha256", hmacSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyUnsubscribe(token: string): string | null {
  const [payload, sig] = (token ?? "").split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", hmacSecret())
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return Buffer.from(payload, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

/* ---------- Destinataires ---------- */

async function recipients(): Promise<string[]> {
  const { data } = await createAdminClient()
    .from("newsletter_subscribers")
    .select("email");
  if (!Array.isArray(data)) return [];
  return (data as unknown as { email: string }[])
    .map((r) => String(r.email ?? "").trim().toLowerCase())
    .filter((e) => e.includes("@"));
}

/* ---------- Gabarit ---------- */

function layout(title: string, highlight: string, body: string, cta: { label: string; href: string }, email: string) {
  const unsub = `${appUrl()}/newsletter/desinscription?token=${signUnsubscribe(email)}`;
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#fbf3e4;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;">
<div style="font-size:22px;color:#221610;">Ch0c0leg0 <span style="color:#ff6b4a">.</span></div>
<h1 style="font-size:28px;font-weight:normal;color:#221610;margin:24px 0 8px;">${title}</h1>
<p style="font-size:20px;color:#ff6b4a;margin:0 0 16px;">${highlight}</p>
<p style="font-size:15px;line-height:1.6;color:#4a3421;">${body}</p>
<p style="margin:28px 0;"><a href="${cta.href}" style="display:inline-block;background:#221610;color:#fbf3e4;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;">${cta.label}</a></p>
<hr style="border:none;border-top:1px solid #22161022;margin:32px 0 16px;" />
<p style="font-size:12px;color:#4a3421aa;">Tu reçois cet e-mail car tu es inscrit à la lettre Ch0c0leg0. <a href="${unsub}" style="color:#4a3421;">Se désinscrire</a></p>
</div></body></html>`;
}

async function sendOne(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const key = brevoKey();
  if (!key) throw new Error("BREVO_API_KEY absente");
  const res = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      "api-key": key,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: from(),
      to: [{ email: opts.to }],
      subject: opts.subject,
      htmlContent: opts.html,
    }),
  });
  if (!res.ok) {
    let detail = await res.text().catch(() => "");
    try {
      const j = JSON.parse(detail) as { message?: string };
      detail = j.message ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(`Brevo ${res.status}: ${detail}`);
  }
}

async function sendCampaign(opts: {
  subject: string;
  title: string;
  highlight: string;
  body: string;
  cta: { label: string; href: string };
}): Promise<{ sent: number; skipped: boolean }> {
  if (!brevoKey()) {
    console.log(`[email] BREVO_API_KEY absente — campagne ignorée : ${opts.subject}`);
    return { sent: 0, skipped: true };
  }
  const to = await recipients();
  if (to.length === 0) {
    console.log(`[email] aucun destinataire — campagne ignorée : ${opts.subject}`);
    return { sent: 0, skipped: true };
  }
  const url = appUrl();
  let sent = 0;
  for (const email of to) {
    try {
      await sendOne({
        to: email,
        subject: opts.subject,
        html: layout(opts.title, opts.highlight, opts.body, { ...opts.cta, href: opts.cta.href.startsWith("http") ? opts.cta.href : `${url}${opts.cta.href}` }, email),
      });
      sent += 1;
    } catch (err) {
      console.error(`[email] échec envoi vers ${email} :`, err);
    }
  }
  console.log(`[email] campagne "${opts.subject}" : ${sent}/${to.length} envoyés`);
  return { sent, skipped: false };
}

/* ---------- Campagnes nouveautés ---------- */

/** E-mail de test : envoyé UNIQUEMENT à ton adresse (jamais aux abonnés). */
export async function sendTestEmail(): Promise<void> {
  const key = brevoKey();
  if (!key) throw new Error("BREVO_API_KEY absente dans .env.local");
  const fromAddr = from();
  if (!fromAddr.email || fromAddr.email.includes("ton.adresse")) {
    throw new Error(
      "BREVO_FROM invalide : renseigne une adresse vérifiée dans .env.local (ex: Ch0c0leg0 <bonjour@tonmail.fr>)"
    );
  }
  const to = (process.env.NEWSLETTER_TEST_TO ?? "").trim() || fromAddr.email;
  const url = appUrl();
  await sendOne({
    to,
    subject: "Test Ch0c0leg0",
    html: layout(
      "E-mail de test",
      "Voici Ch0c0leg0.",
      "Si tu lis ceci, la newsletter fonctionne. Pense à vérifier tes spams la première fois.",
      { label: "Voir la boutique", href: `${url}/products` },
      to
    ),
  });
  console.log(`[email] test envoyé vers ${to}`);
}

export function notifyNewProduct(input: {
  name: string;
  price: number;
  slug: string;
}): Promise<{ sent: number; skipped: boolean }> {
  return sendCampaign({
    subject: `Nouveau : ${input.name}`,
    title: "Fraîchement arrivé",
    highlight: `${input.name} — ${formatPrice(input.price)}`,
    body: "Une nouvelle référence vient d'entrer au catalogue. Les stocks de lancement partent vite.",
    cta: { label: "Voir le produit", href: `/products/${input.slug}` },
  });
}

export function notifyNewCategory(input: {
  name: string;
  slug: string;
}): Promise<{ sent: number; skipped: boolean }> {
  return sendCampaign({
    subject: `Nouveau rayon : ${input.name}`,
    title: "Un nouveau rayon ouvre",
    highlight: input.name,
    body: "On a rangé de nouvelles étagères. Viens fouiller en premier.",
    cta: { label: "Explorer le rayon", href: `/categories/${input.slug}` },
  });
}

export function notifyNewPromo(input: { code: string; label: string }): Promise<{
  sent: number;
  skipped: boolean;
}> {
  return sendCampaign({
    subject: `Code promo : ${input.code}`,
    title: "Bonne nouvelle",
    highlight: `${input.code} — ${input.label}`,
    body: "Un nouveau code vient d'être activé. Colle-le dans le champ promo au moment de payer.",
    cta: { label: "J'en profite", href: "/products" },
  });
}

/* ---------- Transactionnel discret (commandes) ---------- */

function transactionalHtml(opts: {
  title: string;
  highlight: string;
  body: string;
  cta: { label: string; href: string };
}): string {
  const url = appUrl();
  const href = opts.cta.href.startsWith("http") ? opts.cta.href : `${url}${opts.cta.href}`;
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#fbf3e4;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;">
<div style="font-size:22px;color:#221610;">Ch0c0leg0 <span style="color:#ff6b4a">.</span></div>
<h1 style="font-size:24px;font-weight:normal;color:#221610;margin:24px 0 8px;">${opts.title}</h1>
<p style="font-size:18px;color:#ff6b4a;margin:0 0 16px;">${opts.highlight}</p>
<p style="font-size:15px;line-height:1.6;color:#4a3421;">${opts.body}</p>
<p style="margin:28px 0;"><a href="${href}" style="display:inline-block;background:#221610;color:#fbf3e4;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:15px;">${opts.cta.label}</a></p>
<p style="font-size:12px;color:#4a3421aa;">E-mail automatique lié à ta commande. Réponds via la page Contact si besoin.</p>
</div></body></html>`;
}

async function sendTransactional(opts: {
  to: string;
  subject: string;
  title: string;
  highlight: string;
  body: string;
  cta: { label: string; href: string };
}): Promise<void> {
  const key = brevoKey();
  if (!key) {
    console.log(`[email] transactionnel ignoré (pas de clé) : ${opts.subject} → ${opts.to}`);
    return;
  }
  await sendOne({ to: opts.to, subject: opts.subject, html: transactionalHtml(opts) });
}

export function sendOrderConfirmed(input: {
  to: string;
  name: string;
  orderId: number;
  totalLabel: string;
}): Promise<void> {
  return sendTransactional({
    to: input.to,
    subject: `Commande #${input.orderId} confirmée`,
    title: `Merci ${input.name || "à toi"}`,
    highlight: `Commande #${input.orderId} — ${input.totalLabel}`,
    body: "Paiement bien reçu. On prépare ton colis sous 48h ouvrées. Tu peux suivre ta commande depuis ton compte ou la page suivi.",
    cta: { label: "Suivre ma commande", href: "/suivi" },
  });
}

export function sendOrderShipped(input: {
  to: string;
  orderId: number;
  tracking?: string;
}): Promise<void> {
  return sendTransactional({
    to: input.to,
    subject: `Commande #${input.orderId} expédiée`,
    title: "Bonne nouvelle",
    highlight: `Colis #${input.orderId} en route`,
    body: input.tracking
      ? `Ton colis est parti. Suivi : ${input.tracking}.`
      : "Ton colis est parti. Le suivi apparaîtra dans ton compte dès que le transporteur le prend en charge.",
    cta: { label: "Voir ma commande", href: "/suivi" },
  });
}

export function sendOrderRefunded(input: { to: string; orderId: number }): Promise<void> {
  return sendTransactional({
    to: input.to,
    subject: `Commande #${input.orderId} remboursée`,
    title: "Remboursement effectué",
    highlight: `Commande #${input.orderId}`,
    body: "Le remboursement est parti sur ton moyen de paiement. Délai bancaire habituel : 5 à 10 jours.",
    cta: { label: "Mes commandes", href: "/compte/commandes" },
  });
}

export function sendAbandonedCart(input: {
  to: string;
  totalLabel: string;
  count: number;
}): Promise<void> {
  return sendTransactional({
    to: input.to,
    subject: "Ton panier t'attend",
    title: "Tu as oublié quelque chose ?",
    highlight: `${input.count} article(s) — ${input.totalLabel}`,
    body: "Ton panier est toujours là, stock réel sous réserve. Un clic et c'est reparti.",
    cta: { label: "Reprendre mon panier", href: "/cart" },
  });
}