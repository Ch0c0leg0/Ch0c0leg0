"use client";

import { useEffect, useRef } from "react";
import {
  gsap,
  gsapRegister,
  prefersReducedMotion,
} from "@/lib/motion/gsap";
import { formatPrice } from "@/lib/format";

/** Compteur animé au scroll (viens : prix en centimes ou entier + suffixe). */
export function Counter({
  value,
  money = false,
  suffix = "",
  className,
  duration = 1.4,
}: {
  value: number;
  money?: boolean;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = (money ? formatPrice(value) : String(value)) + suffix;
      return;
    }
    gsapRegister();
    const obj = { n: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        n: value,
        duration,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          el.textContent =
            (money ? formatPrice(Math.round(obj.n)) : String(Math.round(obj.n))) +
            suffix;
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [value, money, suffix, duration]);

  return <span ref={ref} className={className} />;
}
