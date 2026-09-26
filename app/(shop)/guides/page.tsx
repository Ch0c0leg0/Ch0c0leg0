import type { Metadata } from "next";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Guides" };

const FALLBACK = [
  { slug: "bien-choisir-son-clavier", title: "Bien choisir son clavier gaming", excerpt: "Membrane, mécanique, TKL : l’essentiel sans jargon." },
  { slug: "souris-legere-ou-lourde", title: "Souris légère ou lourde ?", excerpt: "DPI, capteur, prise en main : ce qui change vraiment." },
  { slug: "entretenir-son-setup", title: "Entretenir son setup", excerpt: "Nettoyage, câbles, ergonomie : 10 minutes par mois." },
];

export default async function GuidesPage() {
  let posts = FALLBACK;
  try {
    const { data } = await createAdminClient()
      .from("posts")
      .select("slug,title,excerpt")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(20);
    if (Array.isArray(data) && data.length > 0) {
      posts = (data as unknown as { slug: unknown; title: unknown; excerpt: unknown }[]).map((p) => ({
        slug: String(p.slug),
        title: String(p.title),
        excerpt: String(p.excerpt ?? ""),
      }));
    }
  } catch {
    // Fallback statique discret.
  }
  return (
    <div className="container-page max-w-3xl py-12">
      <p className="kicker text-cocoa/60">Guides</p>
      <h1 className="font-display mt-2 text-3xl font-light text-espresso">Conseils courts, sans blabla</h1>
      <ul className="mt-8 space-y-4">
        {posts.map((p) => (
          <li key={p.slug} className="card p-6">
            <Link href={`/guides/${p.slug}`} className="font-display text-xl text-espresso hover:text-coral">
              {p.title}
            </Link>
            <p className="mt-1 text-sm text-cocoa/70">{p.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
