import Stripe from "stripe";

let cached: Stripe | null = null;

function isPlaceholderKey(key: string): boolean {
  const normalized = key.trim();
  if (!normalized) return true;
  // Valeurs d'exemple laissées dans .env.example / .env.local
  if (normalized.includes("xxx") || normalized.includes("CHANGE_MOI")) return true;
  if (normalized === "sk_test" || normalized === "pk_test") return true;
  // Une vraie clé Stripe test ressemble à sk_test_51... (longue)
  if (normalized.startsWith("sk_test_") && normalized.length < 20) return true;
  return false;
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || isPlaceholderKey(key)) return null;
  if (!cached) {
    cached = new Stripe(key);
  }
  return cached;
}

export function hasStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return false;
  return !isPlaceholderKey(key);
}