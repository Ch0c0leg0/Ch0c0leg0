import Link from "next/link";
import { Plus } from "lucide-react";
import { getProductsAdmin } from "@/lib/queries";
import { ProductImage } from "@/components/product-image";
import { toggleActiveAction, deleteProductAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { RefreshButton } from "@/components/admin/refresh-button";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const perPage = 20;
  const all = await getProductsAdmin();
  const filtered = q
    ? all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.categoryName ?? "").toLowerCase().includes(q)
      )
    : all;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const products = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-honey">
            Catalogue
          </p>
          <h1 className="font-display mt-1 text-3xl font-light tracking-tight">
            Produits
          </h1>
          <p className="mt-1 text-sm text-cocoa/60">
            {products.length} produit(s) au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action="/admin/products" className="hidden sm:block">
            <input
              name="q"
              defaultValue={q}
              placeholder="Rechercher…"
              className="input w-52 py-2 text-sm"
            />
          </form>
          <RefreshButton />
          <Link href="/admin/products/new" className="btn-coral">
            <Plus className="h-4 w-4" /> Nouveau produit
          </Link>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2 text-sm text-cocoa/60">
          <span>
            Page {safePage}/{totalPages}
          </span>
          {safePage > 1 && (
            <Link href={`/admin/products?q=${encodeURIComponent(q)}&page=${safePage - 1}`} className="btn-ghost text-xs">
              ← Précédent
            </Link>
          )}
          {safePage < totalPages && (
            <Link href={`/admin/products?q=${encodeURIComponent(q)}&page=${safePage + 1}`} className="btn-ghost text-xs">
              Suivant →
            </Link>
          )}
        </div>
      )}

      <div className="card overflow-hidden">
        {products.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-cocoa/50">
            Aucun produit. Commencez par en créer un.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso/10 bg-cream/50 text-left text-[11px] uppercase tracking-[0.14em] text-cocoa/60">
                  <th className="px-5 py-3 font-bold">Produit</th>
                  <th className="px-5 py-3 font-bold">Catégorie</th>
                  <th className="px-5 py-3 font-bold text-right">Prix</th>
                  <th className="px-5 py-3 font-bold text-right">Stock</th>
                  <th className="px-5 py-3 font-bold text-center">Visible</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/8">
                {products.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-cream/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-cream-deep ring-1 ring-espresso/10">
                          <ProductImage
                            src={p.imageUrl || "/placeholder.svg"}
                            alt={p.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-espresso">{p.name}</p>
                          <p className="text-xs text-cocoa/50">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-cocoa/70">
                      {p.categoryName ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-espresso">
                      {(p.price / 100).toFixed(2).replace(".", ",")} €
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={
                          p.stock === 0
                            ? "badge badge-red"
                            : p.stock <= 5
                              ? "badge badge-amber"
                              : "badge badge-stone"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <form action={toggleActiveAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                            p.active ? "bg-espresso" : "bg-espresso/20"
                          }`}
                          title={p.active ? "Cliquer pour masquer" : "Cliquer pour afficher"}
                        >
                          <span
                            className={`h-5 w-5 rounded-full bg-white shadow ${
                              p.active ? "translate-x-5" : "translate-x-0"
                            } transition-transform`}
                          />
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="btn-ghost text-xs"
                        >
                          Voir
                        </Link>
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="btn-ghost text-xs"
                        >
                          Modifier
                        </Link>
                        <DeleteButton
                          action={deleteProductAction}
                          id={p.id}
                          label="Supprimer"
                          confirmMessage={`Supprimer définitivement « ${p.name} » ?`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
