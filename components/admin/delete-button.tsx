"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

export function DeleteButton({
  action,
  id,
  label = "Supprimer",
  confirmMessage = "Confirmer la suppression ?",
  className = "btn-ghost text-xs",
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  label?: string;
  confirmMessage?: string;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <form action={action} onSubmit={() => setConfirming(false)} className="inline-flex">
      <input type="hidden" name="id" value={id} />
      {confirming ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-coral/10 p-1 pr-1 ring-1 ring-coral/30">
          <button
            type="submit"
            className="btn-danger px-3 py-1 text-xs"
          >
            Confirmer
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="btn-ghost px-3 py-1 text-xs"
          >
            Annuler
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={`${className} text-[#b23a20] hover:bg-coral/10`}
          title={confirmMessage}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          {label}
        </button>
      )}
    </form>
  );
}
