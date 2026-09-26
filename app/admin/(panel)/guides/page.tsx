import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { deletePostAction, togglePostPublishedAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { RefreshButton } from "@/components/admin/refresh-button";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  published: boolean;
  createdAt: number;
};

export default async function AdminGuidesPage() {
  let posts: Post[] = [];
  let missingTable = false;
  try {
    const { data, error } = await createAdminClient()
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    posts = (Array.isArray(data) ? data : []).map((r) => {
      const row = r as unknown as Record<string, unknown>;
      return {
        id: Number(row.id ?? 0),
        slug: String(row.slug ?? ""),
        title: String(row.title ?? ""),
        excerpt: String(row.excerpt ?? ""),
        published: Boolean(row.published),
        createdAt: Number(row.created_at ?? 0),
      };
    });
  } catch {
    missingTable = true;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-honey">
            Contenu
          </p>
          <h1 className="font-display mt-1 text-3xl font-light tracking-tight">
            Guides
          </h1>
          <p className="mt-1 text-sm text-cocoa/60">
            {posts.length} article(s) — les publiés apparaissent sur /guides.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <Link href="/admin/guides/new" className="btn-coral">
            <Plus className="h-4 w-4" /> Nouveau guide
          </Link>
        </div>
      </header>

      {missingTable && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Table introuvable — exécutez <span className="font-mono">supabase/migration_all_lots.sql</span> dans
          le SQL Editor Supabase.
        </p>
      )}

      <div className="card overflow-hidden">
        {posts.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-cocoa/50">
            Aucun guide. Le blog affiche ses articles de secours en attendant.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-espresso/10 bg-cream/50 text-left text-[11px] uppercase tracking-[0.14em] text-cocoa/60">
                  <th className="px-5 py-3 font-bold">Titre</th>
                  <th className="px-5 py-3 font-bold">Créé le</th>
                  <th className="px-5 py-3 font-bold text-center">Publié</th>
                  <th className="px-5 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso/8">
                {posts.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-cream/70">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-espresso">{p.title}</p>
                      <p className="truncate text-xs text-cocoa/50">
                        /guides/{p.slug} — {p.excerpt.slice(0, 80)}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-cocoa/70">
                      {p.createdAt ? formatDate(p.createdAt) : "—"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <form action={togglePostPublishedAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className={`inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                            p.published ? "bg-espresso" : "bg-espresso/20"
                          }`}
                          title={p.published ? "Cliquer pour masquer" : "Cliquer pour publier"}
                        >
                          <span
                            className={`h-5 w-5 rounded-full bg-white shadow ${
                              p.published ? "translate-x-5" : "translate-x-0"
                            } transition-transform`}
                          />
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {p.published && (
                          <Link
                            href={`/guides/${p.slug}`}
                            target="_blank"
                            className="btn-ghost text-xs"
                          >
                            Voir
                          </Link>
                        )}
                        <Link href={`/admin/guides/${p.id}/edit`} className="btn-ghost text-xs">
                          <Pencil className="h-3.5 w-3.5" /> Modifier
                        </Link>
                        <DeleteButton
                          action={deletePostAction}
                          id={p.id}
                          label="Supprimer"
                          confirmMessage={`Supprimer le guide « ${p.title} » ?`}
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
