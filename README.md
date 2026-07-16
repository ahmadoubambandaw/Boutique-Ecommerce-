# Boutique — Headless Commerce SaaS

Plateforme e-commerce **headless, multi-tenant** propulsée par **Shopify**.
Chaque client connecte sa propre boutique Shopify et obtient un storefront
premium, plus rapide et élégant que les thèmes Shopify classiques — sans jamais
dupliquer les données. **Shopify reste la source unique de vérité.**

Construit avec Next.js 15 (App Router), React 19, TypeScript strict, Tailwind
CSS v4, Framer Motion, Zustand et TanStack Query. Prêt à déployer sur Vercel.

---

## ✨ Fonctionnalités

### Storefront
- **Accueil** premium (hero animé, collections, tendances, éditorial)
- **Catalogue** avec filtres (prix, couleur, marque, disponibilité) et tris
- **Collections** + pages collection
- **Fiche produit** : galerie avec zoom, sélecteur de variantes, stock en temps
  réel, onglets (description, spécifications, avis, FAQ), produits similaires,
  partage, ajout panier / favoris / comparateur, achat immédiat
- **Recherche instantanée** (prédictive) avec historique et suggestions
- **Panier** : mise à jour temps réel, barre de livraison offerte, codes promo,
  redirection vers le **checkout sécurisé Shopify**
- **Compte client**, connexion, inscription, historique, suivi de commande,
  téléchargement de facture
- **Wishlist**, **comparateur** (jusqu'à 4 produits), **produits vus récemment**
- **Blog**, **À propos**, **Contact**, **FAQ**, **CGV**, **Confidentialité**
- **404 personnalisée**, **Dark Mode**, responsive mobile-first
- **SEO** : Schema.org (Product, FAQ, Article, Store), Open Graph, Twitter Cards,
  sitemap dynamique, robots.txt, URLs propres
- **PWA** (manifest + thème)

### Dashboard administrateur (`/admin`)
Tableau de bord **séparé** et **en lecture seule** : chiffre d'affaires,
commandes, visiteurs, taux de conversion, produits populaires, commandes
récentes. Les données proviennent de Shopify — **aucune modification produit**.

### Super Admin (`/admin/super`)
Pilotage de la plateforme SaaS : liste des boutiques, **MRR**, répartition par
plan, statuts d'abonnement, suspension / suppression de compte.

### Multi-tenant SaaS
- Onboarding via **OAuth Shopify** (`/api/auth/shopify`)
- Isolation complète par tenant : domaine, thème, couleurs, polices, bannières,
  SEO, Pixel Meta, Google Analytics, logo, favicon
- Plans **Basic / Pro / Enterprise** avec **Stripe** (voir `/pricing`)
- Architecture prête pour des milliers de boutiques

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── (shop)/              # Storefront (route group + layout avec chrome)
│   │   ├── (auth)/          #   login / register
│   │   ├── products/        #   catalogue + fiche produit
│   │   ├── collections/     #   collections
│   │   ├── cart, wishlist, compare, search, account, track …
│   │   ├── about, contact, faq, blog, privacy, terms, pricing
│   │   └── layout.tsx       #   header, footer, panier, comparateur
│   ├── admin/               # Dashboard + Super Admin (shell séparé)
│   ├── api/
│   │   ├── auth/shopify/     #   OAuth onboarding + callback
│   │   ├── revalidate/       #   webhooks Shopify → revalidation cache
│   │   └── search/           #   recherche prédictive
│   ├── layout.tsx           # Layout racine minimal (providers, thème, SEO)
│   ├── sitemap.ts / robots.ts / manifest.ts / not-found / error
│   └── globals.css          # Design system (tokens, dark mode, glassmorphism)
├── components/
│   ├── ui/                  # Primitives (button, input, badge, skeleton …)
│   ├── layout/ home/ product/ collection/ catalog/ cart/ search/ admin/ …
│   └── providers, analytics, theme-toggle, tenant-theme-style
└── lib/
    ├── shopify/             # Client Storefront, queries GraphQL, types, OAuth
    ├── tenant/              # Modèle multi-tenant, registry, plans
    ├── store/               # Zustand : cart, wishlist, compare, recently-viewed
    ├── actions/             # Server actions : cart, checkout
    ├── admin/               # Analytics + tenants (Super Admin)
    ├── mock/                # Données démo (fallback sans identifiants Shopify)
    ├── catalog.ts           # Façade catalogue (Shopify → fallback démo)
    ├── validations.ts       # Schémas Zod (RHF + serveur)
    ├── seo.ts / utils.ts
```

### Principes clés
- **Shopify = source unique de vérité.** Aucun produit stocké localement. Le
  catalogue est récupéré à la demande via la Storefront API, mis en cache par
  Next (ISR + tags) et revalidé instantanément par les **webhooks Shopify**.
- **Tenant-aware.** Chaque requête Shopify est scopée aux identifiants du tenant
  actif (`resolveTenant()`), ce qui permet de servir des milliers de boutiques
  depuis un seul déploiement.
- **Dégradation élégante.** Sans identifiants Shopify configurés, le storefront
  s'affiche entièrement grâce à un catalogue de démonstration isolé
  (`lib/mock`). Dès que les identifiants sont fournis, tout bascule sur Shopify.
- **TypeScript strict**, code modulaire, hooks et services séparés, composants
  réutilisables.

---

## 🚀 Démarrage

```bash
npm install
cp .env.example .env.local   # renseignez vos identifiants
npm run dev                  # http://localhost:3000
```

Le site fonctionne **immédiatement** avec des données de démonstration.
Pour connecter Shopify, renseignez au minimum :

```bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxxxxxx
```

Voir `.env.example` pour la liste complète (Admin API, OAuth, Stripe, DB…).

### Scripts
| Commande            | Description                       |
|---------------------|-----------------------------------|
| `npm run dev`       | Serveur de développement          |
| `npm run build`     | Build de production               |
| `npm start`         | Serveur de production             |
| `npm run lint`      | ESLint (next/core-web-vitals)     |
| `npm run typecheck` | Vérification TypeScript stricte   |

---

## 🔌 Connecter Shopify

1. Créez une app dans votre admin Shopify.
2. Récupérez un **Storefront API access token** (public) → `SHOPIFY_STOREFRONT_ACCESS_TOKEN`.
3. (Optionnel) Un token **Admin API** pour les analytics dashboard.
4. Configurez les **webhooks** vers `/api/revalidate`
   (`products/update`, `collections/update`, `inventory_levels/update`) avec
   `SHOPIFY_WEBHOOK_SECRET` — toute modification dans Shopify se reflète alors
   instantanément sur le site.

### Multi-tenant (OAuth)
Pour l'onboarding self-service, configurez `SHOPIFY_API_KEY` /
`SHOPIFY_API_SECRET` / `SHOPIFY_APP_SCOPES`. Le flux vit dans
`src/app/api/auth/shopify/` et `src/lib/shopify/oauth.ts`. Branchez la
persistance des tenants (`src/lib/tenant/registry.ts` → `loadTenantFromStore`)
sur votre base (Postgres/Supabase/Drizzle).

---

## ☁️ Déploiement Vercel

1. Importez le dépôt sur Vercel.
2. Ajoutez les variables d'environnement (voir `.env.example`).
3. Déployez. ISR, optimisation d'images et cache sont préconfigurés.

Pour le multi-tenant par domaine : ajoutez les domaines des clients dans Vercel
et pointez-les vers le projet ; `resolveTenant()` route par `host`.

---

## 🧭 Points d'intégration à finaliser en production

Ces zones sont câblées et documentées, prêtes à recevoir votre backend :

- **Auth client** : Shopify Customer Account API (`login`, `register`, `account`)
- **Persistance tenants** : `lib/tenant/registry.ts`
- **Stripe** : création d'abonnement au callback OAuth + gestion Super Admin
- **Suivi de commande / factures** : Shopify Admin API (`track`, `account`)
- **Newsletter / Contact** : votre ESP / helpdesk

---

## 🛠️ Stack technique

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · shadcn-style UI ·
Framer Motion · GSAP · Zustand · TanStack Query · React Hook Form · Zod ·
Shopify Storefront & Admin API · Stripe · Vercel.
