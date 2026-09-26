import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { updatePostAction } from "@/app/admin/actions";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = "force-dynamic";

export default async function AdminEditGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await createAdminClient()
    .from("posts")
    .select("*")
    .eq("id", Number(id))
    .maybeSingle();
  if (!data) notFound();
  const row = data as unknown as Record<string, unknown>;
  const post = {
    id: Number(row.id ?? 0),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    body: String(row.body ?? ""),
    published: Boolean(row.published),
  };

  return (
    <div className="space-y-6">
      <div>
        <nav
          aria-label="Fil d'Ariane"
          className="flex flex-wrap items-center gap-1.5 text-sm text-cocoa/50"
        >
          <Link href="/admin/guides" className="font-medium hover:text-espresso">
            Guides
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden />
          <span className="max-w-60 truncate font-semibold text-espresso">
            {post.title}
          </span>
        </nav>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-light tracking-tight">
            Modifier le guide
          </h1>
          <span className={`badge ${post.published ? "badge-green" : "badge-stone"}`}>
            {post.published ? "Publié" : "Brouillon"}
          </span>
        </div>
      </div>

      <PostForm post={post} saveAction={updatePostAction} />
    </div>
  );
}
