import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getCategoriesWithCounts } from "@/lib/queries";
import { CategoryIcon } from "@/components/category-icon";
import { SplitTitle } from "@/components/motion/split-title";
import { GsapReveal } from "@/components/motion/gsap-reveal";

export const metadata: Metadata = {
  title: "Catégories",
  description: "Claviers, souris, tapis, casques, écrans, chaises, manettes.",
};

const TINTS = [
  "bg-cream-deep text-espresso group-hover:bg-espresso group-hover:text-cream",
  "bg-cream-deep text-espresso group-hover:bg-espresso group-hover:text-cream",
  "bg-cream-deep text-espresso group-hover:bg-espresso group-hover:text-cream",
  "bg-cream-deep text-espresso group-hover:bg-espresso group-hover:text-cream",
  "bg-cream-deep text-espresso group-hover:bg-espresso group-hover:text-cream",
  "bg-cream-deep text-espresso group-hover:bg-espresso group-hover:text-cream",
  "bg-cream-deep text-espresso group-hover:bg-espresso group-hover:text-cream",
];

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="container-page py-10 md:py-14">
      <SplitTitle
        as="h1"
        text="Sept univers, un seul setup."
        accentWords={["setup."]}
        className="display-section max-w-2xl font-display text-espresso"
      />
      <p className="mt-2 text-sm text-cocoa/70">
        Sept rayons. Pas de piège. Clique, trie, équipe-toi.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => (
          <GsapReveal key={c.id} delay={Math.min(i * 0.06, 0.3)}>
            <Link
              href={`/categories/${c.slug}`}
              className="group relative flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-espresso/10 bg-white p-7 shadow-[0_10px_30px_-18px_rgb(34_22_16/0.3)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-lift"
            >
              <CategoryIcon
                name={c.icon}
                className="absolute -bottom-6 -right-6 h-36 w-36 text-espresso/[0.05] transition-all duration-700 group-hover:rotate-[10deg] group-hover:scale-110 group-hover:text-coral/10"
              />
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110 ${TINTS[i % TINTS.length]}`}
              >
                <CategoryIcon name={c.icon} className="h-7 w-7" />
              </span>
              <span>
                <span className="block font-display text-2xl font-normal text-espresso">
                  {c.name}
                </span>
                <span className="mt-1 block text-sm text-cocoa/65">
                  {c.productCount} produit{c.productCount > 1 ? "s" : ""}. À toi
                  de trier.
                </span>
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-coral">
                Voir le rayon
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </span>
            </Link>
          </GsapReveal>
        ))}
      </div>
    </div>
  );
}
