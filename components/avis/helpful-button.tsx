"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";

export function HelpfulButton({ reviewId, initialCount }: { reviewId: number; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(`helpful-${reviewId}`) === "1"
  );
  const [busy, setBusy] = useState(false);

  async function vote() {
    if (voted || busy) return;
    setBusy(true);
    try {
      const guestKey = window.localStorage.getItem("ch0c0leg0_guest_key") ?? `g-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem("ch0c0leg0_guest_key", guestKey);
      const res = await fetch(`/api/avis/${reviewId}/utile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (typeof data.helpfulCount === "number") setCount(data.helpfulCount);
      else setCount((c) => c + 1);
      setVoted(true);
      window.localStorage.setItem(`helpful-${reviewId}`, "1");
    } catch {
      setCount((c) => c + 1);
      setVoted(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={vote}
      disabled={voted || busy}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        voted ? "border-espresso/20 bg-cream-deep text-espresso" : "border-espresso/15 text-cocoa/70 hover:border-espresso/30 hover:text-espresso"
      }`}
      aria-pressed={voted}
    >
      <ThumbsUp className="h-3.5 w-3.5" /> Utile{count > 0 ? ` (${count})` : ""}
    </button>
  );
}
