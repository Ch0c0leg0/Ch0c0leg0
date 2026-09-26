"use client";

import { useEffect, useRef } from "react";
import {
  gsap,
  gsapRegister,
  prefersReducedMotion,
  EASE,
} from "@/lib/motion/gsap";
import { cn } from "@/lib/cn";

/**
 * Titre animé mot à mot (découpe maison, sans plugin payant).
 * Les mots d'accent passent en italique Mirage — jamais en gras ni en couleur.
 * `immediate` : joue au montage (hero) plutôt qu'au scroll.
 */
export function SplitTitle({
  text,
  className,
  accentWords = [],
  immediate = false,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  accentWords?: string[];
  immediate?: boolean;
  as?: "h1" | "h2" | "p" | "span";
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    gsapRegister();
    const targets = el.querySelectorAll("[data-word]");
    const ctx = gsap.context(() => {
      gsap.set(targets, { yPercent: 110 });
      gsap.to(targets, {
        yPercent: 0,
        duration: 1,
        ease: EASE,
        stagger: 0.06,
        ...(immediate
          ? { delay: 0.15 }
          : {
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                once: true,
              },
            }),
      });
    }, ref);
    return () => ctx.revert();
  }, [immediate, text]);

  const T = Tag as unknown as React.ElementType;
  return (
    <T ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.08em] align-bottom"
        >
          <span
            data-word
            className={cn(
              "inline-block will-change-transform",
              accentWords.includes(w) && "italic"
            )}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </T>
  );
}
