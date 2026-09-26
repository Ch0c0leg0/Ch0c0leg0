"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  gsap,
  gsapRegister,
  prefersReducedMotion,
  isDesktop,
} from "@/lib/motion/gsap";

/** Parallaxe verticale douce liée au scroll (desktop uniquement). */
export function Parallax({
  children,
  speed = -12,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || !isDesktop()) return;
    gsapRegister();
    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: speed,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
