import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

/** Étoiles de lecture (note moyenne, remplissage partiel via largeur). */
export function Stars({
  value,
  className,
  starClass = "h-3.5 w-3.5",
}: {
  value: number;
  className?: string;
  starClass?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / 5) * 100));
  const row = (filled: boolean) => (
    <span className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            starClass,
            filled ? "fill-honey text-honey" : "text-espresso/20"
          )}
        />
      ))}
    </span>
  );
  return (
    <span
      className={cn("relative inline-flex", className)}
      role="img"
      aria-label={`${value.toFixed(1)} sur 5`}
    >
      {row(false)}
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pct}%` }}
      >
        {row(true)}
      </span>
    </span>
  );
}
