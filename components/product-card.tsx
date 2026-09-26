import Link from "next/link";
import { TicketPercent } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/supabase/types";
import type { RatingSummary } from "@/lib/reviews";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favoris/favorite-button";
import { ProductImage } from "@/components/product-image";
import { Stars } from "@/components/avis/stars";
import { cn } from "@/lib/cn";

export function ProductCard({
  product,
  rating,
}: {
  product: Product;
  rating?: RatingSummary;
}) {
  const onSale =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discount = onSale
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;
  const lowStock = product.stock > 0 && product.stock <= 3;

  return (
    <article className="card group relative flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-lift">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-cream-deep"
        aria-label={product.name}
      >
        <ProductImage
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-espresso/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {onSale && (
          <span className="badge-coral absolute left-3 top-3 shadow-warm">
            <TicketPercent className="h-3 w-3" /> −{discount} %
          </span>
        )}
        {lowStock && (
          <span className="badge-amber absolute bottom-3 left-3 shadow-warm">
            Plus que {product.stock} !
          </span>
        )}
        <FavoriteButton productId={product.id} className="absolute right-3 top-3" />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-[17px] font-normal leading-snug text-espresso transition-colors group-hover:text-coral">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-lg font-bold text-espresso">
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span className="text-sm font-light text-espresso/40 line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
        <div className="mt-auto flex items-center gap-2 pt-3">
          {rating && rating.count > 0 ? (
            <span className="flex items-center gap-1.5">
              <Stars value={rating.average} />
              <span className="text-xs font-light text-cocoa/60">
                {rating.average.toFixed(1)} ({rating.count})
              </span>
            </span>
          ) : (
            <>
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                   product.stock > 0 ? "bg-honey" : "bg-coral"
                )}
              />
              <span className="text-xs font-light text-cocoa/65">
                {product.stock > 0 ? "En stock" : "Épuisé"}
              </span>
            </>
          )}
        </div>
        <div className="pt-1">
          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            name={product.name}
            price={product.price}
            imageUrl={product.imageUrl}
            stock={product.stock}
            className="text-xs"
          />
        </div>
      </div>
    </article>
  );
}
