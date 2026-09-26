"use client";

import { useEffect, useRef } from "react";
import {
  gsap,
  gsapRegister,
  prefersReducedMotion,
  EASE,
} from "@/lib/motion/gsap";
import { cn } from "@/lib/cn";

/** Filet qui se trace au scroll — séparation de sections élégante. */
export function DividerTrace({ className, dark = false }: { className?: string; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    gsapRegister();
    const ctx = gsap.context(() => {
      gsap.set(el, { scaleX: 0 });
      gsap.to(el, {
        scaleX: 1,
        duration: 1.4,
        ease: EASE,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "h-px w-full origin-left",
        dark ? "bg-cream/15" : "bg-espresso/10",
        className
      )}
    />
  );
}
