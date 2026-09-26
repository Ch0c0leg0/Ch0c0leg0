import { db } from "./index";
import { categories, products } from "./schema";
import { slugify } from "@/lib/format";

const CATEGORIES = ["Décoration", "Cuisine", "Luminaires", "Mobilier", "Mode"];

type SeedProduct = {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  categorySlug: string;
  featured?: boolean;
  image: string;
};

const img = (seed: string) => `https://picsum.photos/seed/${seed}/1200/1500`;

const PRODUCTS: SeedProduct[] = [
  {
    name: "Vase en céramique émaillée",
    description:
      "Vase fait main en céramique, couverte d'un émail vert kaki. Chaque pièce est unique : les variations de teinte font partie de son charme. Parfait en pièce seule ou en composition.",
    price: 4900,
    compareAtPrice: 6500,
    stock: 14,
    categorySlug: "decoration",
    featured: true,
    image: img("vase-ceramique"),
  },
  {
    name: "Coupe en verre soufflé",
    description:
      "Coupe décorative en verre soufflé à la main, avec un léger dégradé ambré. Idéale comme vide-poche ou coupelle à bijoux.",
    price: 3200,
    stock: 22,
    categorySlug: "decoration",
    featured: true,
    image: img("verre-souffle"),
  },
  {
    name: "Bougeoir en laiton massif",
    description:
      "Bougeoir tourné en laiton massif patiné à la main. Supporte les bougies de 2 cm de diamètre. Se patine joliment avec le temps.",
    price: 2800,
    stock: 8,
    categorySlug: "decoration",
    image: img("bougeoir-laiton"),
  },
  {
    name: "Lampe de table en terrazzo",
    description:
      "Lampe d'appoint au socle en terrazzo et ampoule LED intégrée (inclus). Abat-jour en lin naturel lavable.",
    price: 8900,
    compareAtPrice: 9900,
    stock: 5,
    categorySlug: "luminaires",
    featured: true,
    image: img("lampe-terrazzo"),
  },
  {
    name: "Suspension en canne tissée",
    description:
      "Suspension artisanale en canne tissée à la main sur structure en acier. Diffuse une lumière douce et chaleureuse.",
    price: 12900,
    stock: 4,
    categorySlug: "luminaires",
    image: img("suspension-canne"),
  },
  {
    name: "Bougie parfumée — Bois de santal",
    description:
      "Bougie coulée à la main dans la cire de soja, parfum bois de santal et vanille. Autonomie de 45 heures. Mèche en coton sans plomb.",
    price: 2400,
    stock: 60,
    categorySlug: "decoration",
    featured: true,
    image: img("bougie-santal"),
  },
  {
    name: "Mug en grès — lot de 2",
    description:
      "Lot de deux mugs en grès émaillé au fini mat. Volume 300 ml. Passent au lave-vaisselle et au micro-ondes.",
    price: 3600,
    stock: 30,
    categorySlug: "cuisine",
    image: img("mug-gres"),
  },
  {
    name: "Planche à découper en noyer",
    description:
      "Planche à découper en noyer français massif huilé à l'huile minérale alimentaire. Formats 40 x 25 cm.",
    price: 4500,
    stock: 12,
    categorySlug: "cuisine",
    featured: true,
    image: img("planche-noyer"),
  },
  {
    name: "Verseur à thé en céramique",
    description:
      "Verseur à thé avec filtre intégré en acier inoxydable. Capacité 500 ml. Céramique émaillée à la main.",
    price: 3800,
    stock: 9,
    categorySlug: "cuisine",
    image: img("verseur-the"),
  },
  {
    name: "Chaise en chêne pliante",
    description:
      "Chaise pliante en chêne massif avec assise en toile de coton épais. Pliée, elle se range dans 8 cm d'épaisseur.",
    price: 14900,
    compareAtPrice: 16900,
    stock: 6,
    categorySlug: "mobilier",
    featured: true,
    image: img("chaise-chene"),
  },
  {
    name: "Plateau de service en rotin",
    description:
      "Plateau rectangulaire en rotin tressé avec poignées en cuir végétal. 45 x 30 cm.",
    price: 3500,
    stock: 0,
    categorySlug: "mobilier",
    image: img("plateau-rotin"),
  },
  {
    name: "Tote bag en toile cirée",
    description:
      "Tote bag en toile enduite résistante à l'eau, doublé d'un compartiment zip. Autoportant, volume 12 litres.",
    price: 2900,
    stock: 40,
    categorySlug: "mode",
    featured: true,
    image: img("tote-bag"),
  },
  {
    name: "Ceinture en cuir cousue main",
    description:
      "Ceinture en cuir pleine fleur italien, boucle en laiton brossé. Largeur 3 cm, tailles disponibles de 75 à 110 cm.",
    price: 6800,
    stock: 15,
    categorySlug: "mode",
    image: img("ceinture-cuir"),
  },
  {
    name: "Montre à cadran minimaliste",
    description:
      "Montre homme et femme au cadran blanc épuré, mouvement quartz japonais, bracelet en cuir végétal. Étanche 3 ATM.",
    price: 18900,
    compareAtPrice: 22900,
    stock: 7,
    categorySlug: "mode",
    image: img("montre-minimal"),
  },
];

async function seed() {
  console.log("→ Nettoyage de la base…");
  db.delete(products).run();
  db.delete(categories).run();

  console.log("→ Création des catégories…");
  for (const name of CATEGORIES) {
    db.insert(categories)
      .values({ name, slug: slugify(name) })
      .run();
  }
  const categoryMap = new Map<string, number>();
  for (const c of db.select().from(categories).all()) {
    categoryMap.set(c.slug, c.id);
  }

  console.log(`→ Insertion de ${PRODUCTS.length} produits…`);
  for (const p of PRODUCTS) {
    const categoryId = categoryMap.get(p.categorySlug);
    db.insert(products)
      .values({
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        stock: p.stock,
        imageUrl: p.image,
        active: true,
        featured: p.featured ?? false,
        categoryId: categoryId ?? null,
      })
      .run();
  }

  console.log("✓ Seed terminé.");
  const totals = db
    .select()
    .from(products)
    .all();
  const catCount = db.select().from(categories).all().length;
  console.log(`  ${totals.length} produits, ${catCount} catégories.`);
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });