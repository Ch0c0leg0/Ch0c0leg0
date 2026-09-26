import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Tags, Save } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapCategory } from "@/lib/supabase/mappers";
import type { CategoryRow } from "@/lib/supabase/types";
import { updateCategoryAction, deleteCategoryAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("categories")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();
  if (!data) notFound();
  const category = mapCategory(data as unknown as CategoryRow);

  const { count: productCount } = await admin
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", category.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <nav
          aria-label="Fil d'Ariane"
          className="flex flex-wrap items-center gap-1.5 text-sm text-cocoa/50"
        >
          <Link href="/admin/categories" className="font-medium hover:text-espresso">
            Catégories
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden />
          <span className="font-semibold text-espresso">{category.name}</span>
        </nav>
        <h1 className="font-display mt-2 text-3xl font-light tracking-tight">
          Modifier la catégorie
        </h1>
        <p className="mt-1 text-sm text-cocoa/60">
          {productCount ?? 0} produit(s) rattaché(s).{" "}
          {(productCount ?? 0) > 0 &&
            "La suppression les rendra « sans catégorie »."}
        </p>
      </div>

      <form action={updateCategoryAction} className="card space-y-4 p-6">
        <h2 className="font-display flex items-center gap-2 text-lg font-normal text-espresso">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cream-deep text-espresso">
            <Tags className="h-4 w-4" />
          </span>
          {category.name}
        </h2>
        <input type="hidden" name="id" value={category.id} />
        <div>
          <label className="label" htmlFor="name">
            Nom *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={category.name}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="slug">
            Slug (URL)
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={category.slug}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="icon">
            Icône Lucide
          </label>
          <input
            id="icon"
            name="icon"
            defaultValue={category.icon}
            className="input"
            placeholder="Gamepad2"
          />
          <p className="mt-1 text-xs text-cocoa/50">
            Nom d’icône Lucide (ex : Keyboard, Mouse, Headset, Monitor, Armchair, Gamepad2).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" className="btn-primary">
            <Save className="h-4 w-4" /> Enregistrer
          </button>
        </div>
      </form>

      <div className="card flex flex-wrap items-center justify-between gap-3 border-red-200/60 p-6">
        <p className="text-sm text-cocoa/70">
          Zone dangereuse : la suppression est définitive.
        </p>
        <DeleteButton
          action={deleteCategoryAction}
          id={category.id}
          label="Supprimer la catégorie"
          confirmMessage={`Supprimer la catégorie « ${category.name} » ?`}
          className="btn-ghost px-4 py-2 text-sm"
        />
      </div>
    </div>
  );
}
