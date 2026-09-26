# Ch0c0leg0 — Boutique gaming

Boutique gaming **Next.js 16** : catalogue, panier, comptes, **Stripe** test,
promos et admin. Testé pour de vrai, pas pour la photo.

## Stack

- **Framework** : Next.js 16 (Turbopack, App Router, server actions, TypeScript)
- **Base de données + Auth clients** : [Supabase](https://supabase.com) (Postgres + Auth e-mail/mot de passe, RLS)
- **Paiement** : Stripe Checkout (mode test, montants en **centimes EUR**)
- **Styles** : Tailwind CSS v4
- **Icônes** : Lucide (`lucide-react`) — aucun emoji dans l'UI
- **Animations** : GSAP + ScrollTrigger (scroll design, hero, reveals) + `motion` (micro-interactions) + CSS
- **Auth admin** : session JWT signée (`jose`) stockée dans un cookie sécurisé (inchangée)

## Prérequis

- Node.js **>= 24**
- Un projet [Supabase](https://supabase.com) (URL + clé anon + clé service_role dans `.env.local`)
- Un compte [Stripe](https://dashboard.stripe.com) (mode test)
- `stripe` CLI (facultatif, pour recevoir les webhooks en local)

## Installation

```bash
npm install
cp .env.example .env.local
```

Renseignez ensuite les variables dans `.env.local` (voir § Stripe et § Supabase).

### Base de données (Supabase)

1. Dans le dashboard Supabase : **SQL Editor** → exécutez le contenu de `supabase/schema.sql`
   (crée `categories`, `products`, `profiles`, `promo_codes`, `orders`, `order_items` + RLS).
2. Puis, en local :
   ```bash
   npm run db:seed:gaming   # 7 catégories + 24 produits + codes WELCOME10 / GAMER20
   ```

Notes :
- Les prix sont stockés en centimes.
- L'ancien système SQLite (`lib/db`, `data/boutique.db`) n'est plus utilisé par l'application.

### Lancement

```bash
npm run dev
```

Ouvrir http://localhost:3000 (boutique) et http://localhost:3000/admin (administration).

## Configuration Stripe (mode test)

1. Dans votre [dashboard Stripe](https://dashboard.stripe.com/test/apikeys),
   copiez la **clé secrète** (`sk_test_…`) et la **clé publique** (`pk_test_…`).
2. Dans `.env.local` :
   ```
   STRIPE_SECRET_KEY=sk_test_…
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
   STRIPE_WEBHOOK_SECRET=whsec_…
   ```
3. Recevez les webhooks en local (terminal dédié) :
   ```bash
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```
   Copiez le `whsec_…` affiché dans `.env.local`.
   Sans cela, la page `/checkout/success` confirme quand même la commande
   (fallback idempotent), mais Stripe n'est pas notifié en temps réel.

> **Cartes de test** : utilisez `4242 4242 4242 4242` (n'importe quelle date/CCV).

## Comptes clients

- Inscription : **/inscription** (identifiant + e-mail + mot de passe, via Supabase Auth).
- Connexion : **/connexion**. Confirmation e-mail selon la config du projet Supabase
  (si activée, le lien pointe vers `/auth/callback` puis `/compte`).
- Espace client : **/compte** (profil + adresse, pré-remplit le checkout),
  **/compte/commandes** (historique + détail).
- Le paiement invité reste possible (commande sans `user_id`).

## Catalogue gaming

- 7 catégories : Claviers, Souris, Tapis de souris, Casques, Écrans, Chaises, Manettes.
- Page dédiée par catégorie : **/categories/[slug]** + hub **/categories**.
- Images réelles à déposer dans `public/assets/` (voir `public/assets/README.md`
  pour la liste exacte des 24 fichiers). Sans image, `/placeholder.svg` s'affiche.

## Codes promo

- Prix barrés (`compareAtPrice`) + codes (`promo_codes`) : ex. `WELCOME10` (−10 %),
  `GAMER20` (−20 % dès 150 €).
- Champ dédié dans le checkout (validation via `/api/promo/validate`), remise
  répercutée sur Stripe (coupon à usage unique) et `used_count` incrémenté au paiement.
- Gestion dans l'admin : **/admin/promos**.

## Administration

- Accès : **http://localhost:3000/admin** — URL publique de la boutique : `/`
- Identifiants par défaut (à changer absolument) :
  - Utilisateur : `admin`
  - Mot de passe : `admin123`
- Le mot de passe est vérifié par un hash bcrypt dans `ADMIN_PASSWORD_HASH`
  (variable d'environnement). Pour en générer un : `node -e "console.log(require('bcryptjs').hashSync('votre-mot-de-passe', 10))"`.
  ⚠ Next.js développe les `$` des fichiers `.env` (comme un shell) : échappez
  chaque `$` du hash avec un backslash (`$2b$…` → `\$2b\$…`).
- `AUTH_SECRET` signe les sessions ; définissez une valeur aléatoire longue en production.

## Scripts

| Script            | Rôle                                            |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Serveur de développement                        |
| `npm run build`   | Build de production + vérification TypeScript   |
| `npm run lint`    | ESLint (`eslint`)                               |
| `npm run db:seed:gaming` | Importe le catalogue gaming dans Supabase (7 catégories, 24 produits, promos) |

## Structure

```
app/
  (shop)/            boutique : accueil, products, categories/[slug], cart, checkout,
                     connexion, inscription, compte (profil + commandes)
  auth/callback      retour e-mail Supabase (échange du code contre session)
  admin/             panneau d'administration (login, tableau de bord, produits, catégories, commandes, promos)
  api/               /checkout, /stripe/webhook, /promo/validate, /compte/profil, /auth/*, /upload
components/
  cart/              contexte panier + vue panier (localStorage)
  checkout/          formulaire de commande + code promo (client)
  compte/            formulaires connexion / inscription / déconnexion
  motion/            reveals, split-titres, parallaxe, compteurs, scroll horizontal
  brand/logo.tsx     logo Ch0c0leg0 (monogramme C0 + wordmark)
  ui/                section-heading, marquee, boutons/cards/badges (globals.css)
  admin/             sidebar, login, formulaire produit, upload d'image, bouton suppression
  category-icon.tsx  mapping nom d'icône Lucide → composant
  product-image.tsx  image avec repli /placeholder.svg si /assets absent
lib/
  supabase/          clients browser/server/admin + types + mappers + seed gaming
  queries.ts         lectures catalogue (async, Supabase)
  orders.ts          commandes + confirmation idempotente + décompte du stock
  customer.ts        garde compte client (requireCustomer, ensureProfile)
  promos             via table promo_codes + coupons Stripe à la volée
  auth.ts / session.ts   sessions admin (jose) + garde serveur
  stripe.ts          client Stripe
  format.ts          prix EUR, dates, slugs, libellés de statut
proxy.ts             refresh session Supabase + garde /admin et /api/upload
supabase/schema.sql  DDL + RLS à exécuter dans le SQL Editor
public/assets/       photos produits réelles (voir public/assets/README.md)
```

## Production

- Spécifiez `NEXT_PUBLIC_APP_URL` (ex. `https://votre-domaine.fr`).
- Basculez les clés Stripe en mode **live** quand vous êtes prêt.
- Le fichier SQLite `data/boutique.db` doit être persisté (volume disque)
  et sauvé régulièrement. Les images uploadées vivent dans `public/uploads`.