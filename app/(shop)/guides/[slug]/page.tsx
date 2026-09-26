import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

const FALLBACK: Record<string, { title: string; body: string }> = {
  "bien-choisir-son-clavier": {
    title: "Bien choisir son clavier gaming",
    body: "Mécanique pour la frappe franche, membrane pour le silence, TKL pour gagner de la place. Budget : vise le switch avant le RGB.",
  },
  "souris-legere-ou-lourde": {
    title: "Souris légère ou lourde ?",
    body: "Légère pour les FPS nerveux, plus lourde pour la stabilité. Capteur récent + forme adaptée à ta main > DPI extrême.",
  },
  "entretenir-son-setup": {
    title: "Entretenir son setup",
    body: "Soufflette + chiffon microfibre une fois par mois, câbles attachés, tapis lavé à l’eau tiède. 10 minutes, setup comme neuf.",
  },
};

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post = FALLBACK[slug];
  try {
    const { data } = await createAdminClient().from("posts").select("*").eq("slug", slug).maybeSingle();
    if (data) {
      const row = data as unknown as { title: unknown; body: unknown; excerpt: unknown; published: unknown };
      if (row.published === false) notFound();
      post = { title: String(row.title ?? slug), body: String(row.body ?? row.excerpt ?? "") };
    }
  } catch {
    // Fallback.
  }
  if (!post) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.body.slice(0, 160),
  };
  return (
    <div className="container-page max-w-2xl py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-sm text-cocoa/60">
        <Link href="/guides" className="hover:text-espresso">
          Guides
        </Link>{" "}
        / {post.title}
      </p>
      <h1 className="font-display mt-2 text-3xl font-light text-espresso">{post.title}</h1>
      <p className="mt-6 whitespace-pre-line leading-relaxed text-cocoa/85">{post.body}</p>
      <Link href="/products" className="btn-coral mt-8">
        Voir le matos
      </Link>
    </div>
  );
}
