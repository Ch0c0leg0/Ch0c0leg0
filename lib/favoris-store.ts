"use client";

/** Favoris invité (localStorage) + synchro compte. */

const KEY = "ch0c0leg0_favoris";
export const FAVORIS_EVENT = "ch0c0leg0:favoris";

export function getLocalFavoris(): number[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((n) => Number.isFinite(n))
      : [];
  } catch {
    return [];
  }
}

export function setLocalFavoris(ids: number[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Stockage indisponible : tant pis.
  }
  window.dispatchEvent(new CustomEvent(FAVORIS_EVENT));
}

export function toggleLocalFavoris(productId: number): number[] {
  const ids = getLocalFavoris();
  const next = ids.includes(productId)
    ? ids.filter((id) => id !== productId)
    : [...ids, productId];
  setLocalFavoris(next);
  return next;
}

/** Au login : pousse les favoris locaux vers le compte puis vide le local. */
export async function mergeLocalIntoAccount(): Promise<void> {
  const ids = getLocalFavoris();
  if (ids.length === 0) return;
  await Promise.all(
    ids.map((productId) =>
      fetch("/api/favoris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).catch(() => null)
    )
  );
  setLocalFavoris([]);
}
