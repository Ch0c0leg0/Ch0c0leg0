import { GsapReveal } from "@/components/motion/gsap-reveal";

export function LegalPage({
  kicker,
  title,
  updated,
  sections,
}: {
  kicker: string;
  title: string;
  updated: string;
  sections: { title: string; body: string[] }[];
}) {
  return (
    <div className="container-page max-w-3xl py-12 md:py-16">
      <GsapReveal>
        <p className="kicker text-cocoa/60">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-honey" />
          {kicker}
        </p>
        <h1 className="display-section mt-3 font-display font-light text-espresso">
          {title}
        </h1>
        <p className="mt-2 text-sm font-light text-cocoa/55">{updated}</p>
      </GsapReveal>
      <div className="mt-10 space-y-8">
        {sections.map((s, i) => (
          <GsapReveal key={s.title} delay={Math.min(i * 0.04, 0.2)}>
            <section className="card p-6 sm:p-8">
              <h2 className="font-display text-xl font-normal text-espresso">
                {s.title}
              </h2>
              {s.body.map((p, j) => (
                <p
                  key={j}
                  className="mt-3 text-[15px] font-light leading-relaxed text-cocoa/85"
                >
                  {p}
                </p>
              ))}
            </section>
          </GsapReveal>
        ))}
      </div>
    </div>
  );
}
