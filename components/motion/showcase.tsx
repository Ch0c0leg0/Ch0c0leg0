"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  gsap,
  gsapRegister,
  prefersReducedMotion,
  isDesktop,
} from "@/lib/motion/gsap";

/**
 * Vitrine horizontale épinglée (desktop ≥1024px).
 * Le titre + la progression font partie de la zone épinglée :
 * rien n'est coupé, le pin démarre sous le header sticky.
 * Sur mobile : défilement horizontal natif (snap).
 */
export function Showcase({
  kicker,
  title,
  description,
  linkHref,
  linkLabel,
  trackClassName,
  children,
}: {
  kicker: string;
  title: ReactNode;
  description?: string;
  linkHref: string;
  linkLabel: string;
  trackClassName?: string;
  children: ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (prefersReducedMotion() || !isDesktop()) return;
    gsapRegister();
    const getScroll = () =>
      Math.max(0, track.scrollWidth - window.innerWidth + 80);
    const ctx = gsap.context(() => {
      const tween = gsap.to(track, {
        x: () => -getScroll(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          // Le pin commence quand la section arrive sous le header sticky.
          start: "top 76px",
          end: () => `+=${getScroll()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              gsap.set(progressRef.current, { scaleX: self.progress });
            }
            if (countRef.current) {
              const total = track.children.length;
              const current = Math.min(
                total,
                Math.max(1, Math.round(self.progress * total) + 1)
              );
              countRef.current.textContent = `${String(current).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
            }
          },
        },
      });
      return () => tween.scrollTrigger?.kill();
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-dark relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 top-10 h-[24rem] w-[24rem] rounded-full bg-coral/10 blur-[130px]" />
      </div>

      <div className="relative flex min-h-[calc(100svh-76px)] flex-col justify-center py-10">
        {/* En-tête — visible pendant tout le pin */}
        <div className="container-page mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            {kicker && (
              <p className="kicker text-honey">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-honey" />
                {kicker}
              </p>
            )}
            <h2 className="display-section mt-3 font-display font-light text-cream">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-sm text-cream/60">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span ref={countRef} className="font-mono text-xs tracking-widest text-cream/50">
              01 / 01
            </span>
            <Link
              href={linkHref}
              className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-5 py-2.5 text-sm font-medium text-cream transition-all duration-300 hover:-translate-y-0.5 hover:border-cream/60 hover:bg-cream/10"
            >
              {linkLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Piste */}
        <div
          ref={trackRef}
          className={`flex w-max items-stretch gap-5 overflow-x-auto px-4 pb-2 snap-x snap-mandatory lg:overflow-visible lg:px-10 lg:pb-0 ${trackClassName ?? ""}`}
          style={{ willChange: "transform" }}
        >
          {children}
        </div>

        {/* Progression */}
        <div className="container-page mt-8 hidden lg:block">
          <div className="h-px w-full bg-cream/15">
            <div ref={progressRef} className="h-full w-full origin-left scale-x-0 bg-honey" />
          </div>
        </div>
      </div>
    </section>
  );
}
