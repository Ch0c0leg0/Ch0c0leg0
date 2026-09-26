import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategories } from "@/lib/queries";
import { createProductAction } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center gap-1.5 text-sm text-cocoa/50"
        >
          <Link href="/admin/products" className="font-medium hover:text-espresso">
            Produits
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden />
          <span className="font-semibold text-espresso">Nouveau</span>
        </nav>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight">
          Nouveau produit
        </h1>
        <p className="mt-1 text-sm text-cocoa/60">
          Ajoutez un article au catalogue Ch0c0leg0.
        </p>
      </div>

      <ProductForm
        product={null}
        categories={categories}
        saveAction={createProductAction}
      />
    </div>
  );
}
