import Link from "next/link";
import { ArrowRight, Package, Search, ShieldCheck, Truck } from "lucide-react";
import {
  getCategoriesWithCounts,
  getFeaturedProducts,
  getNewProducts,
  getActiveProducts,
} from "@/lib/queries";
import { ProductGrid } from "@/components/product-grid";
import { ProductImage } from "@/components/product-image";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Stars } from "@/components/avis/stars";
import { getLatestReviews } from "@/lib/reviews";
import { Marquee, MarqueeItem } from "@/components/ui/marquee";
import { GsapReveal } from "@/components/motion/gsap-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { formatPrice } from "@/lib/format";

export default async function HomePage() {
  const [featured, newest, cats] = await Promise.all([
    getFeaturedProducts(8),
    getNewProducts(4),
    getCategoriesWithCounts(),
  ]);

  const perCategory = await Promise.all(
    cats.map(async (c) => {
      const list = await getActiveProducts({ categorySlug: c.slug });
      const min = list.length
        ? Math.min(...list.map((p) => p.price))
        : null;
      return { ...c, minPrice: min, previewImage: list[0]?.imageUrl ?? "" };
    })
  );

  const latestReviews = await getLatestReviews(3).catch(() => []);

  const spotlight = featured[0] ?? newest[0] ?? null;
  const topVentes = featured.slice(0, 8);

  return (
    <div>
      {/* Hero commerce */}
      <section className="section-dark relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] animate-float rounded-full bg-coral/12 blur-[140px]" />
        </div>
        <div className="container-page relative grid gap-10 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-16">
          <div>
            <h1 className="font-display font-light leading-[1.04] tracking-tight text-cream" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}>
              Le matos qui suit <em>ton niveau.</em>
            </h1>
            <form
              action="/products"
              className="relative mt-7 max-w-lg"
              role="search"
            >
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cream/40" />
              <input
                name="q"
                placeholder="Clavier, souris 240 Hz, chaise…"
                autoComplete="off"
                className="w-full rounded-2xl border border-cream/20 bg-cream/10 py-4 pl-13 pr-32 text-[15px] font-light text-cream placeholder:text-cream/40 focus:border-cream/50 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-cream px-5 py-2.5 font-sans text-sm font-bold text-espresso transition-transform duration-300 hover:scale-[1.03] active:scale-95"
              >
                Chercher
              </button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              {perCategory.slice(0, 4).map((c) => (
                <Link
                  key={c.slug}
                  href={`/categories/${c.slug}`}
                  className="rounded-full border border-cream/20 px-4 py-1.5 text-sm font-light text-cream/75 transition-colors duration-300 hover:border-cream/60 hover:text-cream"
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href="/products"
                className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-bold text-honey transition-colors hover:text-cream"
              >
                Tout voir <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {spotlight && (
            <GsapReveal className="mx-auto w-full max-w-sm">
              <div className="rounded-3xl border border-cream/15 bg-cream/[0.06] p-5 backdrop-blur">
                <Link
                  href={`/products/${spotlight.slug}`}
                  className="group flex items-center gap-5"
                >
                  <span className="relative block h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-cream-deep ring-1 ring-white/10">
                    <ProductImage
                      src={spotlight.imageUrl || "/placeholder.svg"}
                      alt={spotlight.name}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-normal uppercase tracking-[0.22em] text-honey">
                      Star du moment
                    </span>
                    <span className="mt-1 block truncate font-display text-xl font-normal text-cream">
                      {spotlight.name}
                    </span>
                    <span className="mt-1 block font-sans text-lg font-bold text-cream">
                      {formatPrice(spotlight.price)}
                    </span>
                  </span>
                </Link>
                <div className="mt-4">
                  <AddToCartButton
                    productId={spotlight.id}
                    slug={spotlight.slug}
                    name={spotlight.name}
                    price={spotlight.price}
                    imageUrl={spotlight.imageUrl}
                    stock={spotlight.stock}
                  />
                </div>
              </div>
            </GsapReveal>
          )}
        </div>
      </section>

      {/* Bandeau */}
      <Marquee>
        {["Livraison offerte", "−10 % sur la première commande", "Stock réel, vérifié"].map(
          (w) => (
            <MarqueeItem key={w} className="font-normal normal-case tracking-normal text-cocoa/70">
              <span className="font-display text-base">{w}</span>
              <span aria-hidden className="text-honey">·</span>
            </MarqueeItem>
          )
        )}
      </Marquee>

      {/* Top ventes */}
      <section className="container-page py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker text-cocoa/60">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-honey" />
              Les préférés
            </p>
            <h2 className="display-section mt-3 font-display font-light text-espresso">
              Top ventes
            </h2>
          </div>
          <GsapReveal delay={0.05}>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-cocoa/70 transition-colors hover:text-espresso"
            >
              Tout le catalogue <ArrowRight className="h-4 w-4" />
            </Link>
          </GsapReveal>
        </div>
        <div className="mt-8">
          <ProductGrid products={topVentes} />
        </div>
      </section>

      {/* Rayons */}
      <section className="border-y border-espresso/10 bg-cream-deep/60">
        <div className="container-page py-14 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker text-cocoa/60">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-honey" />
                Catalogue
              </p>
              <h2 className="display-section mt-3 font-display font-light text-espresso">
                Les rayons
              </h2>
            </div>
            <GsapReveal delay={0.05}>
              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-cocoa/70 transition-colors hover:text-espresso"
              >
                Tous les rayons <ArrowRight className="h-4 w-4" />
              </Link>
            </GsapReveal>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {perCategory.slice(0, 4).map((c, i) => (
              <GsapReveal key={c.slug} delay={Math.min(i * 0.06, 0.2)}>
                <Link
                  href={`/categories/${c.slug}`}
                  className="group block overflow-hidden rounded-3xl border border-espresso/10 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="relative block aspect-[16/10] overflow-hidden bg-cream-deep">
                    <ProductImage
                      src={c.previewImage || "/placeholder.svg"}
                      alt={c.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </span>
                  <span className="flex items-center justify-between gap-2 p-4">
                    <span>
                      <span className="block font-display text-lg font-normal leading-tight text-espresso">
                        {c.name}
                      </span>
                      <span className="mt-0.5 block text-xs font-light text-cocoa/60">
                        {c.productCount} pièce{c.productCount > 1 ? "s" : ""}
                        {c.minPrice !== null && ` · dès ${formatPrice(c.minPrice)}`}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-cocoa/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-espresso" />
                  </span>
                </Link>
              </GsapReveal>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {perCategory.slice(4).map((c) => (
              <GsapReveal key={c.slug}>
                <Link
                  href={`/categories/${c.slug}`}
                  className="group flex items-center justify-between gap-2 rounded-2xl border border-espresso/10 bg-white px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-warm"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-display text-base font-normal text-espresso">
                      {c.name}
                    </span>
                    <span className="block text-xs font-light text-cocoa/60">
                      {c.minPrice !== null && `dès ${formatPrice(c.minPrice)}`}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-cocoa/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-espresso" />
                </Link>
              </GsapReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Nouveautés */}
      <section className="container-page py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker text-cocoa/60">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-honey" />
              Fraîchement arrivé
            </p>
            <h2 className="display-section mt-3 font-display font-light text-espresso">
              Nouveautés
            </h2>
          </div>
          <GsapReveal delay={0.05}>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-cocoa/70 transition-colors hover:text-espresso"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </GsapReveal>
        </div>
        <div className="mt-8">
          <ProductGrid products={newest} />
        </div>
      </section>

      {/* Ils en parlent */}
      {latestReviews.length > 0 && (
        <section className="container-page pb-14 md:pb-20">
          <div>
            <p className="kicker text-cocoa/60">
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-honey" />
              Ils en parlent
            </p>
            <h2 className="display-section mt-3 font-display font-light text-espresso">
              Ils en parlent mieux que nous
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {latestReviews.map((r, i) => (
              <GsapReveal key={r.id} delay={Math.min(i * 0.07, 0.2)}>
                <Link
                  href={`/products/${r.productSlug}#avis`}
                  className="card flex h-full flex-col gap-3 p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
                >
                  <Stars value={r.rating} />
                  <p className="font-display text-lg font-normal leading-snug text-espresso">
                    {r.title || "Avis vérifié par l'équipe"}
                  </p>
                  <p className="line-clamp-3 text-sm font-light leading-relaxed text-cocoa/75">
                    {r.body}
                  </p>
                  <p className="mt-auto pt-2 text-xs font-light text-cocoa/55">
                    <span className="font-bold text-espresso">{r.displayName}</span>
                    {" · "}
                    {r.productName}
                  </p>
                </Link>
              </GsapReveal>
            ))}
          </div>
        </section>
      )}

      {/* Garanties compactes */}
      <section className="border-t border-espresso/10 bg-cream-deep/60">
        <div className="container-page grid gap-4 py-10 sm:grid-cols-3">
          {[
            { Icon: ShieldCheck, title: "Testé avant d'entrer au catalogue", text: "En jouant, des heures." },
            { Icon: Truck, title: "Livraison offerte", text: "Sans seuil, sans astérisque." },
            { Icon: Package, title: "Stock réel", text: "Affiché = dans l'entrepôt." },
          ].map(({ Icon, title, text }, i) => (
            <GsapReveal key={title} delay={i * 0.06}>
              <div className="card flex h-full items-start gap-3 p-5">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-sans text-sm font-bold text-espresso">{title}</span>
                  <span className="mt-0.5 block text-sm font-light text-cocoa/70">{text}</span>
                </span>
              </div>
            </GsapReveal>
          ))}
        </div>
      </section>

      {/* Offre compte */}
      <section className="container-page py-14 md:py-20">
        <GsapReveal className="section-dark relative overflow-hidden rounded-3xl px-8 py-12 text-center md:py-16">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-coral/12 blur-[100px]" />
          </div>
          <h2 className="display-section mx-auto max-w-2xl font-display font-light text-cream">
            −10 % sur ta première commande, <em>dévoilée dans ton compte.</em>
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Magnetic>
              <Link href="/inscription" className="btn-coral px-7 py-3.5">
                Créer mon compte <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-7 py-3.5 text-cream transition-colors duration-300 hover:border-cream/50 hover:bg-cream/5"
            >
              Explorer sans compte
            </Link>
          </div>
        </GsapReveal>
      </section>
    </div>
  );
}
