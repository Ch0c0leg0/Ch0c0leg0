"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      type="submit"
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" /> Déconnexion
    </button>
  );
}
