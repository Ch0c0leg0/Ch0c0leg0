import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Info, RotateCcw, ShieldCheck, ShoppingBag, TicketPercent, Truck } from "lucide-react";
import { getProductImages, getProductWithCategory, getRelatedProducts } from "@/lib/queries";
import { getRatingSummaries } from "@/lib/reviews";
import { formatPrice } from "@/lib/format";
import { ProductPurchase } from "@/components/product-purchase";
import { PackAddButton } from "@/components/product-pack-button";
import { ProductGrid } from "@/components/product-grid";
import { ProductImage } from "@/components/product-image";
import { FavoriteButton } from "@/components/favoris/favorite-button";
import { ReviewsSection } from "@/components/avis/reviews-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { GsapReveal } from "@/components/motion/gsap-reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductWithCategory(slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductWithCategory(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId, 4);
  const gallery = await getProductImages(product.id).catch(() => []);
  const ratingMap = await getRatingSummaries([product.id]).catch(() => new Map());
  const summary = ratingMap.get(product.id);
  const onSale =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.slice(0, 300),
    image: [product.imageUrl, ...gallery.map((g) => g.url)].filter(Boolean).slice(0, 5),
    sku: product.slug,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (product.price / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${appUrl}/products/${product.slug}`,
    },
    ...(summary && summary.count > 0
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: summary.average.toFixed(1), reviewCount: summary.count } }
      : {}),
  };

  return (
    <div className="container-page py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Fil d'Ariane */}
      <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-cocoa/50">
        <Link href="/" className="transition-colors hover:text-espresso">
          Accueil
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="transition-colors hover:text-espresso">
          Boutique
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/categories/${product.category.slug}`}
              className="transition-colors hover:text-espresso"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="max-w-48 truncate font-medium text-espresso">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* Image */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <GsapReveal className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-espresso/10 bg-cream-deep shadow-warm">
            <ProductImage
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {onSale && (
              <span className="badge-coral absolute left-5 top-5 px-3.5 py-1.5 text-sm shadow-warm">
                <TicketPercent className="h-4 w-4" />
                −{Math.round((1 - product.price / product.compareAtPrice!) * 100)} %
              </span>
            )}
            <FavoriteButton productId={product.id} className="absolute right-5 top-5 border-cream/40 bg-night/40 text-cream" />
          </GsapReveal>
          {gallery.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.slice(0, 6).map((g) => (
                <span key={g.id} className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-cream-deep ring-1 ring-espresso/10">
                  <ProductImage src={g.url} alt="" fill sizes="64px" className="object-cover" />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="flex flex-col justify-center">
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="kicker mb-4 text-cocoa/60"
            >
              <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-honey" />
              {product.category.name}
            </Link>
          )}
          <h1 className="font-display font-light leading-[1.02] tracking-tight text-espresso" style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.75rem)" }}>
            {product.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-sans text-3xl font-bold text-espresso">
              {formatPrice(product.price)}
            </span>
            {onSale && (
              <span className="text-xl text-espresso/35 line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          <div className="card mt-6 p-6">
            <h2 className="font-display flex items-center gap-2 text-lg font-normal text-espresso">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
                <Info className="h-4 w-4" />
              </span>
              Description
            </h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-cocoa/85">
              {product.description}
            </p>
          </div>

          <div className="card mt-6 p-5 sm:p-6">
            <h2 className="font-display flex items-center gap-2 text-lg font-normal text-espresso">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
                <ShoppingBag className="h-4 w-4" />
              </span>
              Ajouter au panier
            </h2>
            <div className="mt-4">
              <ProductPurchase
                productId={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                stock={product.stock}
              />
              <PackAddButton main={product} related={related} />
            </div>
          </div>

          <ul className="mt-6 grid gap-2.5 text-sm text-cocoa/75 sm:grid-cols-3">
            <li className="flex items-center gap-3 rounded-2xl bg-cream/60 px-3 py-3 ring-1 ring-espresso/10">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
                <Truck className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-espresso">Livraison offerte</span>
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-cream/60 px-3 py-3 ring-1 ring-espresso/10">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-espresso">Paiement sécurisé</span>
            </li>
            <li className="flex items-center gap-3 rounded-2xl bg-cream/60 px-3 py-3 ring-1 ring-espresso/10">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
                <RotateCcw className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-espresso">Retours 14 jours</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Avis clients */}
      <ReviewsSection productId={product.id} slug={product.slug} />

      {/* Produits similaires */}
      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading
            kicker="Dans le même univers"
            title={<>Vous aimerez aussi</>}
          />
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
