/* Garde anti-crash pour next/image : n'accepte que les sources que
   le loader Next sait optimiser (voir images.remotePatterns dans
   next.config.ts). Toute autre URL -> repli, jamais d'exception. */

const EXACT_HOSTS = new Set(["picsum.photos", "images.unsplash.com"]);

function isAllowedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (EXACT_HOSTS.has(h)) return true;
  // Miroir de next.config.ts : "*.supabase.co".
  if (h === "supabase.co" || h.endsWith(".supabase.co")) return true;
  return false;
}

/** true si `src` peut être passé à <Image> sans lever d'erreur. */
export function isNextImageSafe(src: string): boolean {
  const clean = (src ?? "").trim();
  if (!clean) return false;
  if (clean.startsWith("/")) return true;
  if (clean.startsWith("data:image/")) return true;
  try {
    const url = new URL(clean);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return isAllowedHost(url.hostname);
  } catch {
    return false;
  }
}
