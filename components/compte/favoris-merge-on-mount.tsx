"use client";

import { useEffect } from "react";
import { mergeLocalIntoAccount } from "@/lib/favoris-store";

/**
 * Après un login OAuth (retour via /auth/callback), pousse vers le compte
 * les favoris posés en invité. Sans effet s'il n'y en a pas.
 * (Le login mot de passe le fait déjà dans LoginForm.)
 */
export function FavorisMergeOnMount() {
  useEffect(() => {
    mergeLocalIntoAccount().catch(() => {});
  }, []);
  return null;
}
