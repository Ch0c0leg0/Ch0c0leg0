"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  gsap,
  gsapRegister,
  prefersReducedMotion,
  isDesktop,
} from "@/lib/motion/gsap";

/**
 * Défilement horizontal épinglé (desktop ≥1024px).
 * Sur mobile : simple défilement horizontal natif (snap).
 */
export function HorizontalScroll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (prefersReducedMotion() || !isDesktop()) return;
    gsapRegister();
    const getScroll = () => track.scrollWidth - window.innerWidth;
    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -getScroll(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getScroll()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={className}>
      <div
        ref={trackRef}
        className="flex w-max items-stretch gap-6 overflow-x-auto px-4 pb-4 snap-x snap-mandatory lg:overflow-visible lg:px-10 lg:pb-0"
      >
        {children}
      </div>
    </section>
  );
}
