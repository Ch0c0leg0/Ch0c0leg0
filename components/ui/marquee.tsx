import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Bandeau défilant infini (CSS pur, pause au hover). Contenu dupliqué ×2. */
export function Marquee({
  children,
  className,
  dark = false,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "marquee-mask overflow-hidden border-y py-4",
        dark ? "border-white/10 bg-night" : "border-espresso/10 bg-cream-deep",
        className
      )}
    >
      <div className="marquee-track">
        <div className="flex items-center gap-8">{children}</div>
        <div className="flex items-center gap-8" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

export function MarqueeItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-8 whitespace-nowrap font-display text-sm font-normal uppercase tracking-[0.2em]",
        className
      )}
    >
      {children}
    </span>
  );
}
