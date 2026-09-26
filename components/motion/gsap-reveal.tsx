"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  gsap,
  gsapRegister,
  prefersReducedMotion,
  EASE,
} from "@/lib/motion/gsap";

/**
 * Apparition au scroll : montée + fondu (+ léger défloutage desktop).
 * État initial appliqué en JS uniquement → contenu visible sans JS.
 */
export function GsapReveal({
  children,
  className,
  delay = 0,
  y = 36,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "span" | "li";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    gsapRegister();
    const ctx = gsap.context(() => {
      gsap.set(el, { opacity: 0, y, filter: "blur(6px)" });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.9,
        delay,
        ease: EASE,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [delay, y]);

  const T = Tag as unknown as React.ElementType;
  return <T ref={ref} className={className}>{children}</T>;
}
