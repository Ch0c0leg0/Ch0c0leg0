import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductById, getCategories } from "@/lib/queries";
import { updateProductAction } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/product-form";
import { ProductGallery } from "@/components/admin/product-gallery";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) notFound();
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <nav
          aria-label="Fil d'Ariane"
          className="flex flex-wrap items-center gap-1.5 text-sm text-cocoa/50"
        >
          <Link href="/admin/products" className="font-medium hover:text-espresso">
            Produits
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden />
          <span className="max-w-60 truncate font-semibold text-espresso">
            {product.name}
          </span>
        </nav>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Modifier le produit
          </h1>
          <span
            className={`badge ${
              product.active ? "badge-green" : "badge-stone"
            }`}
          >
            {product.active ? "Visible" : "Masqué"}
          </span>
        </div>
        <p className="mt-1 text-sm text-cocoa/60">
          Ajustez les informations, le prix et la visibilité.
        </p>
      </div>

      <ProductForm
        product={product}
        categories={categories}
        saveAction={updateProductAction}
      />
      <ProductGallery productId={product.id} />
    </div>
  );
}
