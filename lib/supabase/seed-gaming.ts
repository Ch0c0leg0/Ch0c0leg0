/* Seed du catalogue gaming — Supabase.
   Prérequis : exécuter supabase/schema.sql dans le SQL Editor du dashboard.
   Lancement : npm run db:seed:gaming
   Les images sont attendues dans public/assets/<categorie>/<produit>.webp
   (fournies par le propriétaire). En leur absence, /placeholder.svg s'affiche.
*/
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/format";

type SeedCategory = { name: string; icon: string };
type SeedProduct = {
  name: string;
  description: string;
  price: number; // centimes
  compareAtPrice?: number;
  stock: number;
  category: string; // slug catégorie
  featured?: boolean;
  image: string;
};

const CATEGORIES: SeedCategory[] = [
  { name: "Claviers", icon: "Keyboard" },
  { name: "Souris", icon: "Mouse" },
  { name: "Tapis de souris", icon: "Layers" },
  { name: "Casques", icon: "Headset" },
  { name: "Écrans", icon: "Monitor" },
  { name: "Chaises", icon: "Armchair" },
  { name: "Manettes", icon: "Gamepad2" },
];

const img = (cat: string, file: string) => `/assets/${cat}/${file}.webp`;

const PRODUCTS: SeedProduct[] = [
  // ----- Claviers -----
  {
    name: "Apex Pro 75 — Hall Effect",
    description:
      "Clavier gaming 75 % à switches magnétiques Hall Effect : rapid trigger, actuations réglables et frappe ultra-réactive. Châssis aluminium, keycaps PBT double-shot, RGB par touche.",
    price: 15999,
    compareAtPrice: 18999,
    stock: 12,
    category: "claviers",
    featured: true,
    image: img("claviers", "apex-pro-75"),
  },
  {
    name: "Pulse TKL RGB",
    description:
      "Clavier tenkeyless mécanique (switches linéaires), 1000 Hz, mousse insonorisante double couche. Idéal pour viser juste sans sacrifier le confort de frappe.",
    price: 10999,
    stock: 20,
    category: "claviers",
    image: img("claviers", "pulse-tkl-rgb"),
  },
  {
    name: "Nomad 60 Sans-fil",
    description:
      "Compact 60 % tri-mode (2,4 GHz / Bluetooth / USB-C), 4000 mAh, switches pré-lubrifiés. Le compagnon nomade des setups épurés.",
    price: 12999,
    compareAtPrice: 14999,
    stock: 8,
    category: "claviers",
    featured: true,
    image: img("claviers", "nomad-60-sans-fil"),
  },
  {
    name: "Forge Full-Size Silencieux",
    description:
      "Format 100 % à switches tactiles silencieux, repose-poignets magnétique inclus. Parfait pour jouer tard sans réveiller toute la maison.",
    price: 8999,
    stock: 15,
    category: "claviers",
    image: img("claviers", "forge-full-size-silencieux"),
  },
  // ----- Souris -----
  {
    name: "Viper Ultralight 49 g",
    description:
      "Souris esport 49 g, capteur 26K DPI, switches optiques (90 M de clics), polling 1000 Hz. La précision à l'état pur.",
    price: 7999,
    stock: 25,
    category: "souris",
    featured: true,
    image: img("souris", "viper-ultralight-49g"),
  },
  {
    name: "Titan Sans-fil Pro",
    description:
      "Souris sans-fil 2,4 GHz à 4000 Hz, 90 h d'autonomie, capteur 30K DPI, coque ergonomique droitiers. Zéro compromis entre confort et performance.",
    price: 9999,
    compareAtPrice: 11999,
    stock: 14,
    category: "souris",
    image: img("souris", "titan-sans-fil-pro"),
  },
  {
    name: "Scout Ergo",
    description:
      "Souris ergonomique verticale 57°, idéale pour les longues sessions bureau comme gaming. 6 boutons programmables, DPI ajustable jusqu'à 12 800.",
    price: 5999,
    stock: 30,
    category: "souris",
    image: img("souris", "scout-ergo"),
  },
  {
    name: "Fury MMO 12 boutons",
    description:
      "Grille latérale de 12 boutons mécaniques, capteur 20K DPI, mémoire embarquée pour 5 profils. Conçue pour les MMO et MOBA exigeants.",
    price: 8999,
    stock: 10,
    category: "souris",
    image: img("souris", "fury-mmo-12-boutons"),
  },
  // ----- Tapis -----
  {
    name: "Glide XXL 900×400",
    description:
      "Tapis XXL 900×400×4 mm, surface speed micro-texturée, base caoutchouc antidérapante, bords cousus. De la place pour clavier + souris.",
    price: 3999,
    stock: 40,
    category: "tapis-de-souris",
    featured: true,
    image: img("tapis-de-souris", "glide-xxl"),
  },
  {
    name: "Control Speed L",
    description:
      "Format L 450×400 mm, surface hybride contrôle/vitesse, lavable en machine. Le choix équilibré des joueurs polyvalents.",
    price: 2999,
    stock: 35,
    category: "tapis-de-souris",
    image: img("tapis-de-souris", "control-speed-l"),
  },
  {
    name: "Arena RGB",
    description:
      "Tapis XL à éclairage RGB adressable (14 modes), surface glide optimisée capteurs, alimentation USB détachable.",
    price: 4999,
    compareAtPrice: 5999,
    stock: 18,
    category: "tapis-de-souris",
    image: img("tapis-de-souris", "arena-rgb"),
  },
  // ----- Casques -----
  {
    name: "Orbit Sans-fil 7.1",
    description:
      "Casque sans-fil 2,4 GHz + Bluetooth, son spatial 7.1, drivers 50 mm, micro détachable à réduction de bruit, 60 h d'autonomie.",
    price: 14999,
    compareAtPrice: 17999,
    stock: 9,
    category: "casques",
    featured: true,
    image: img("casques", "orbit-sans-fil-71"),
  },
  {
    name: "Strike Filaire Studio",
    description:
      "Casque filaire fermé aux drivers 40 mm accordés studio, arceau renforcé, coussinets mémoire. Précis pour le jeu, excellent pour la musique.",
    price: 7999,
    stock: 22,
    category: "casques",
    image: img("casques", "strike-filaire-studio"),
  },
  {
    name: "Halo ANC",
    description:
      "Casque à réduction de bruit active hybride, 40 h d'autonomie (ANC activé), multipoint, son haute résolution. Le silence pour mieux entendre l'ennemi.",
    price: 19999,
    stock: 6,
    category: "casques",
    image: img("casques", "halo-anc"),
  },
  {
    name: "Duo Chat HD",
    description:
      "Micro-casque chat HD ultra-léger (180 g), perche flexible, molette de volume. L'essentiel pour rester en lien avec l'équipe.",
    price: 4999,
    stock: 28,
    category: "casques",
    image: img("casques", "duo-chat-hd"),
  },
  // ----- Écrans -----
  {
    name: "Vision 27\" QHD 180 Hz",
    description:
      "Dalle IPS 27\" QHD (2560×1440), 180 Hz, 1 ms GtG, HDR400, 98 % DCI-P3. Le sweet spot du gaming PC.",
    price: 29999,
    compareAtPrice: 34999,
    stock: 5,
    category: "ecrans",
    featured: true,
    image: img("ecrans", "vision-27-qhd-180hz"),
  },
  {
    name: "Ultra 34\" Incurvé 165 Hz",
    description:
      "Ultra-large 34\" 3440×1440 incurvé 1500R, 165 Hz, VA contrasté 3000:1. Immersion totale pour sim-racing et RPG.",
    price: 54999,
    stock: 3,
    category: "ecrans",
    image: img("ecrans", "ultra-34-incurve-165hz"),
  },
  {
    name: "Swift 24\" 240 Hz Esport",
    description:
      "Dalle 24\" Full HD 240 Hz pensée pour la compétition : 0,5 ms, mode anti-flou, pied réglable en hauteur. Chaque milliseconde compte.",
    price: 22999,
    stock: 7,
    category: "ecrans",
    image: img("ecrans", "swift-24-240hz-esport"),
  },
  // ----- Chaises -----
  {
    name: "Throne Ergo Mesh",
    description:
      "Chaise ergonomique en mesh respirant, soutien lombaire dynamique, accoudoirs 4D, vérin classe 4 (150 kg). Pour des sessions marathon.",
    price: 34999,
    stock: 4,
    category: "chaises",
    image: img("chaises", "throne-ergo-mesh"),
  },
  {
    name: "Racer Simili-cuir",
    description:
      "Fauteuil gaming style baquet en simili-cuir premium, dossier inclinable 180°, coussins cervicaux et lombaires offerts.",
    price: 27999,
    compareAtPrice: 31999,
    stock: 5,
    category: "chaises",
    image: img("chaises", "racer-simili-cuir"),
  },
  {
    name: "Cloud Repose-pieds",
    description:
      "Fauteuil large avec repose-pieds télescopique, mousse haute densité, accoudoirs souples. Le confort d'un nuage, la posture d'un pro.",
    price: 39999,
    stock: 3,
    category: "chaises",
    image: img("chaises", "cloud-repose-pieds"),
  },
  // ----- Manettes -----
  {
    name: "Pro Hall Effect",
    description:
      "Manette pro PC/Switch/Mobile à sticks Hall Effect anti-drift, gâchettes à butée réglable, 4 palettes dorsales, 1000 Hz en filaire.",
    price: 6999,
    stock: 24,
    category: "manettes",
    featured: true,
    image: img("manettes", "pro-hall-effect"),
  },
  {
    name: "Arcade Fight Stick",
    description:
      "Stick arcade 8 boutons Sanwa-style, châssis métal, câble détachable, compatible PC/PS. Pour les versus comme à la salle.",
    price: 11999,
    stock: 7,
    category: "manettes",
    image: img("manettes", "arcade-fight-stick"),
  },
  {
    name: "Retro Sans-fil",
    description:
      "Manette rétro sans-fil 2,4 GHz + Bluetooth, croix directionnelle précise, 20 h d'autonomie. Parfaite pour le rétro-gaming et l'indé.",
    price: 3999,
    stock: 32,
    category: "manettes",
    image: img("manettes", "retro-sans-fil"),
  },
];

const PROMOS = [
  { code: "WELCOME10", type: "percent", value: 10, min_amount: 0, active: true, usage_limit: null as number | null },
  { code: "GAMER20", type: "percent", value: 20, min_amount: 15000, active: true, usage_limit: 100 as number | null },
];

async function main() {
  const admin = createAdminClient();

  console.log("→ Catégories…");
  for (const c of CATEGORIES) {
    const slug = slugify(c.name);
    const { error } = await admin
      .from("categories")
      .upsert({ name: c.name, slug, icon: c.icon }, { onConflict: "slug" });
    if (error) throw new Error(`upsert catégorie ${c.name} : ${error.message}`);
  }
  const { data: catRows, error: catError } = await admin
    .from("categories")
    .select("id,slug");
  if (catError) throw new Error(catError.message);
  const catBySlug = new Map(
    (catRows as unknown as { id: number; slug: string }[]).map((c) => [c.slug, c.id])
  );

  console.log("→ Produits (remplacement du catalogue)…");
  const { error: delError } = await admin
    .from("order_items")
    .delete()
    .neq("id", 0);
  if (delError) console.warn("  (order_items non vidés :", delError.message, ")");
  const { error: delOrders } = await admin.from("orders").delete().neq("id", 0);
  if (delOrders) console.warn("  (orders non vidées :", delOrders.message, ")");
  const { error: delProducts } = await admin.from("products").delete().neq("id", 0);
  if (delProducts) throw new Error(`delete produits : ${delProducts.message}`);

  for (const p of PRODUCTS) {
    const categoryId = catBySlug.get(p.category);
    const { error } = await admin.from("products").insert({
      name: p.name,
      slug: slugify(p.name),
      description: p.description,
      price: p.price,
      compare_at_price: p.compareAtPrice ?? null,
      stock: p.stock,
      image_url: p.image,
      active: true,
      featured: p.featured ?? false,
      category_id: categoryId ?? null,
    });
    if (error) throw new Error(`insert ${p.name} : ${error.message}`);
  }

  console.log("→ Codes promo…");
  for (const promo of PROMOS) {
    const { error } = await admin
      .from("promo_codes")
      .upsert(promo, { onConflict: "code" });
    if (error) throw new Error(`upsert promo ${promo.code} : ${error.message}`);
  }

  console.log(`✓ Seed terminé : ${CATEGORIES.length} catégories, ${PRODUCTS.length} produits, ${PROMOS.length} promos.`);
  console.log("  Images attendues dans public/assets/<categorie>/<produit>.webp");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Échec du seed :", e.message ?? e);
    console.error("As-tu exécuté supabase/schema.sql dans le SQL Editor ?");
    process.exit(1);
  });
