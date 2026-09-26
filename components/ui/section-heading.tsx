import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { GsapReveal } from "@/components/motion/gsap-reveal";

export function SectionHeading({
  kicker,
  kickerClassName,
  title,
  description,
  align = "left",
  dark = false,
  className,
}: {
  kicker: string;
  kickerClassName?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}) {
  return (
    <GsapReveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <p
        className={cn(
          "kicker",
          dark ? "text-honey" : "text-cocoa/60",
          kickerClassName
        )}
      >
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-honey"
        />
        {kicker}
      </p>
      <h2
        className={cn(
          "display-section mt-3 font-display",
          dark ? "text-cream" : "text-espresso"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-3 text-base leading-relaxed",
            dark ? "text-cream/70" : "text-cocoa/80"
          )}
        >
          {description}
        </p>
      )}
    </GsapReveal>
  );
}
