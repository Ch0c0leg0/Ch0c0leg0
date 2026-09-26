import Link from "next/link";
import { Plus, Tags, Pencil } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapCategory } from "@/lib/supabase/mappers";
import type { CategoryRow } from "@/lib/supabase/types";
import { createCategoryAction } from "@/app/admin/actions";
import { RefreshButton } from "@/components/admin/refresh-button";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const admin = createAdminClient();
  const [{ data: catRows }, { data: productRows }] = await Promise.all([
    admin.from("categories").select("*").order("name", { ascending: true }),
    admin.from("products").select("category_id"),
  ]);

  const cats = Array.isArray(catRows)
    ? (catRows as unknown as CategoryRow[]).map(mapCategory)
    : [];
  const countById = new Map<number, number>();
  if (Array.isArray(productRows)) {
    for (const r of productRows as unknown as { category_id: number | null }[]) {
      if (r.category_id === null) continue;
      countById.set(r.category_id, (countById.get(r.category_id) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-honey">
            Catalogue
          </p>
          <h1 className="font-display mt-1 text-3xl font-light tracking-tight">
            Catégories
          </h1>
          <p className="mt-1 text-sm text-cocoa/60">
            Organisez vos produits par catégorie.
          </p>
        </div>
        <RefreshButton />
      </header>

      {/* Création */}
      <form action={createCategoryAction} className="card p-5 sm:p-6">
        <h2 className="font-display text-lg font-normal text-espresso">
          Nouvelle catégorie
        </h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-40 flex-1">
            <label className="label" htmlFor="cat-name">
              Nom
            </label>
            <input id="cat-name" name="name" required className="input" placeholder="Ex : Claviers" />
          </div>
          <div className="min-w-40 flex-1">
            <label className="label" htmlFor="cat-slug">
              Slug (optionnel)
            </label>
            <input id="cat-slug" name="slug" className="input" placeholder="auto-généré" />
          </div>
          <div className="min-w-40 flex-1">
            <label className="label" htmlFor="cat-icon">
              Icône Lucide (optionnel)
            </label>
            <input id="cat-icon" name="icon" className="input" placeholder="Gamepad2" />
          </div>
          <button type="submit" className="btn-primary">
            <Plus className="h-4 w-4" /> Créer
          </button>
        </div>
      </form>

      {/* Liste */}
      <div className="card overflow-hidden">
        {cats.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-cocoa/50">
            Aucune catégorie pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso/10 bg-cream/50 text-left text-[11px] uppercase tracking-[0.14em] text-cocoa/60">
                  <th className="px-5 py-3 font-bold">Nom</th>
                  <th className="px-5 py-3 font-bold text-right">Produits</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/8">
                {cats.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-cream/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cream-deep text-cocoa ring-1 ring-espresso/10">
                          <Tags className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="font-semibold text-espresso">{c.name}</p>
                          <p className="text-xs text-cocoa/50">/{c.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="badge badge-stone">
                        {countById.get(c.id) ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/categories/${c.id}/edit`} className="btn-ghost text-xs">
                        <Pencil className="h-3.5 w-3.5" /> Modifier
                      </Link>
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
