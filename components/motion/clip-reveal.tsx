"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  gsap,
  gsapRegister,
  prefersReducedMotion,
  EASE,
} from "@/lib/motion/gsap";

/** Révélation par masque : l'image se dévoile de bas en haut. */
export function ClipReveal({
  children,
  className,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    gsapRegister();
    const ctx = gsap.context(() => {
      gsap.set(el, { clipPath: "inset(12% 6% 12% 6% round 2.5rem)", opacity: 0.4, scale: 0.985 });
      gsap.to(el, {
        clipPath: "inset(0% 0% 0% 0% round 2.5rem)",
        opacity: 1,
        scale: 1,
        duration: 1.3,
        ease: EASE,
        ...(immediate
          ? { delay: 0.2 }
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
  }, [immediate]);

  return (
    <div ref={ref} className={className} style={{ willChange: "clip-path, transform" }}>
      {children}
    </div>
  );
}
