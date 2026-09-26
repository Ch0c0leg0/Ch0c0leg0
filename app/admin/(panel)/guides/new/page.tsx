import { createPostAction } from "@/app/admin/actions";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = "force-dynamic";

export default function AdminNewGuidePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-honey">
          Contenu
        </p>
        <h1 className="font-display mt-1 text-3xl font-light tracking-tight">
          Nouveau guide
        </h1>
        <p className="mt-1 text-sm text-cocoa/60">
          Court, utile, sans blabla — comme le reste de la boutique.
        </p>
      </div>
      <PostForm saveAction={createPostAction} />
    </div>
  );
}
