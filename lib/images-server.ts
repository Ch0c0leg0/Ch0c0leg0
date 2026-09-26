import { existsSync } from "node:fs";
import { join, normalize, sep } from "node:path";

import "server-only";

export const PLACEHOLDER_IMAGE = "/placeholder.svg";

/**
 * Repli serveur pour les visuels locaux absents (ex. photos `/assets`
 * référencées par le seed mais pas encore déposées dans `public/`).
 *
 * Sans ça, le navigateur requête `/_next/image?url=/assets/...` qui répond
 * 400 (« The requested resource isn't a valid image ») avant le repli
 * client — d'où le bruit console. Ici la normalisation a lieu à la source
 * (mappers), aucun composant n'a besoin de changer.
 *
 * Fichier réservé au serveur : ne jamais l'importer depuis un composant client.
 */
export function resolvePublicImageUrl(src: unknown): string {
  const clean = String(src ?? "").trim();
  if (!clean || clean === PLACEHOLDER_IMAGE) return clean || PLACEHOLDER_IMAGE;
  // Distant ou inline : le loader Next / le navigateur s'en charge.
  if (!clean.startsWith("/") || clean.startsWith("//")) return clean;
  try {
    const relative = normalize(clean.replace(/\?.*$/, "").replace(/#.*$/, ""))
      .replace(/^[/\\]+/, "")
      .split(sep)
      .filter((seg) => seg && seg !== ".")
      .join(sep);
    // Anti-remontée : le chemin final doit rester dans `public/`.
    if (relative.split(sep).includes("..")) return PLACEHOLDER_IMAGE;
    const absolute = join(process.cwd(), "public", relative);
    const publicDir = join(process.cwd(), "public") + sep;
    if (!absolute.startsWith(publicDir)) return PLACEHOLDER_IMAGE;
    return existsSync(absolute) ? clean : PLACEHOLDER_IMAGE;
  } catch {
    return PLACEHOLDER_IMAGE;
  }
}
