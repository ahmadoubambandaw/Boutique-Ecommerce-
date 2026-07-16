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

## 🧭 État des intégrations

### ✅ Implémenté (bloc critique)
- **Base de données tenants** — Drizzle ORM + Postgres (`lib/db`, `lib/tenant/repository.ts`).
  Migrations dans `drizzle/`. `resolveTenant()` route désormais par domaine via la DB.
- **Auth client réelle** — Shopify Storefront Customer API : connexion, inscription,
  déconnexion, compte + commandes réelles (`lib/auth`, server actions). Session via
  cookie httpOnly.
- **Stripe** — Checkout d'abonnement, webhooks (cycle de vie complet), Billing Portal
  (`lib/stripe`, `api/stripe/*`). Plans mappés aux Price IDs Stripe.
- **Persistance OAuth** — Le callback provisionne le tenant : token Storefront,
  enregistrement des webhooks Shopify, création du client Stripe, écriture en DB
  (`lib/tenant/provision.ts`).

> Ces couches se dégradent proprement : sans `DATABASE_URL` / `STRIPE_SECRET_KEY`
> l'app tourne en mode démo (données de démonstration) et le build reste vert.

### ✅ Implémenté (bloc important)
- **Sécurité `/admin`** — auth admin (scrypt + session HMAC via Web Crypto),
  rôles (`admin_users`), middleware edge protégeant `/admin/*` et `/admin/super`
  (`super_admin`), avec passthrough en mode démo. Seed : `npm run seed:admin`.
- **Analytics dashboard réelles** — chiffre d'affaires, série hebdo, nombre de
  commandes, produits populaires, commandes récentes calculés depuis l'API Admin
  Shopify (`lib/shopify/admin.ts`, `lib/admin/analytics.ts`). Badge « live/démo ».
- **Suivi de commande réel** — recherche par numéro + e-mail via l'API Admin
  (transporteur, numéro, timeline) — `lib/actions/orders.ts`.

- **Middleware multi-domaine** — `middleware.ts` résout le host tenant sur toutes
  les routes et le transmet via `x-tenant-host` (la résolution DB reste côté
  serveur). Prévisualisation d'un tenant via `?__tenant=slug`.
- **Éditeur de thème tenant** — formulaire self-service dans `/admin/settings`
  (couleurs, police, arrondis, logo, favicon, bannière, SEO, Pixel/GA), persisté
  en DB et appliqué instantanément (`lib/tenant/settings-actions.ts`).

### ⏳ Reste à finaliser
- Factures PDF (l'API Admin expose l'URL de statut de commande, pas le PDF —
  générer via un service tiers ou l'API Order Printer)
- Visiteurs / taux de conversion (brancher Google Analytics / Plausible)
- Newsletter / Contact (ESP / helpdesk)
- Chargement effectif des polices alternatives (le choix est persisté ; seule
  Geist est câblée pour l'instant)
- Tests automatisés (unitaires + E2E) et monitoring

### Mise en route base de données
```bash
# 1. Renseignez DATABASE_URL dans .env.local
# 2. Appliquez le schéma
npm run db:push        # ou db:generate + db:migrate
```

---

## 🛠️ Stack technique

Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · shadcn-style UI ·
Framer Motion · GSAP · Zustand · TanStack Query · React Hook Form · Zod ·
Shopify Storefront & Admin API · Stripe · Vercel.
