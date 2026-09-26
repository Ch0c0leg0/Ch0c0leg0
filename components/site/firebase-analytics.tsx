"use client";

import { useEffect } from "react";

/**
 * Initialise Firebase Analytics une fois, côté navigateur uniquement.
 * Import différé : le SDK ne pèse pas sur le bundle initial.
 * No-op si la config est absente/incomplète ou Analytics non supporté.
 */
export function FirebaseAnalytics() {
  useEffect(() => {
    void import("@/lib/firebase/client").then((m) =>
      m.getFirebaseAnalytics()
    );
  }, []);
  return null;
}
