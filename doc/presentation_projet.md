# Eburnie — Dossier de présentation

> Document de référence pour soutenance / entretien technique
> Projet : plateforme e-commerce **Eburnie** (Côte d'Ivoire)
> Stack : Next.js 16 · React 19 · Prisma · MySQL · NextAuth · Cloudinary

---

## 1. Objectifs du projet

Eburnie est une plateforme e-commerce conçue pour le marché ivoirien, avec trois objectifs principaux :

1. **Permettre aux clients d'acheter en ligne** sans nécessairement disposer de moyens de paiement électroniques — d'où le choix du **paiement à la livraison** comme modèle économique central.
2. **Offrir une expérience moderne et fluide**, à la hauteur des standards internationaux (UI réactive, mobile-first, animations, mode offline pour le panier et les favoris).
3. **Fournir aux administrateurs un back-office complet** pour gérer catalogue, commandes, utilisateurs et paramètres sans toucher au code ni à la base de données.

Le projet répond à un besoin local : la majorité des plateformes e-commerce existantes en Afrique de l'Ouest sont soit trop génériques (Shopify), soit centrées sur le mobile money. Eburnie se positionne comme une solution intermédiaire, simple, en français, avec un workflow adapté.

---

## 2. Fonctionnalités principales

### Côté client (boutique publique)

- **Catalogue** : navigation par catégories, recherche full-text, filtres (prix, disponibilité), tri (récent, prix, popularité)
- **Fiche produit** : galerie d'images, description, prix barré, stock indicatif, produits similaires, avis clients (note 1-5 + commentaire)
- **Panier persistant** : stocké en `localStorage` via Zustand (survit aux fermetures de navigateur)
- **Favoris** : liste personnelle persistée localement
- **Compte utilisateur** : inscription, connexion, mot de passe oublié (email de réinitialisation), profil modifiable, historique des commandes
- **Tunnel de commande** : récap panier → adresse de livraison (avec géolocalisation optionnelle) → confirmation → email de confirmation
- **Paiement à la livraison uniquement** (cash on delivery)

### Côté administrateur (back-office)

- **Tableau de bord** : statistiques (CA, commandes, utilisateurs, produits)
- **Gestion produits** : CRUD complet, upload multi-images via Cloudinary, gestion du stock, mise en avant, désactivation (vs suppression)
- **Gestion catégories** : CRUD, image de couverture
- **Gestion commandes** : liste filtrable/paginée, vue détail, changement de statut (PENDING → CONFIRMED → SHIPPED → DELIVERED ou CANCELLED avec restauration automatique du stock), actions en lot
- **Gestion utilisateurs** : liste, promotion ADMIN/CLIENT, réinitialisation de mot de passe par email, suppression
- **Paramètres** : configuration unique du site (téléphone service client, WhatsApp, email, slogan, frais de livraison)

### Fonctionnalités transverses

- **Notifications email** : confirmation de commande, réinitialisation de mot de passe, message de contact
- **Rate limiting** : protection contre brute-force sur les routes sensibles (login, register, reset)
- **Validation stricte** : tous les payloads API sont validés avec **Zod**
- **SEO** : sitemap dynamique, balises meta, slugs sémantiques
- **Modale de confirmation custom** (`useConfirm`) pour toutes les actions destructives
- **Système de toasts** unifié pour les retours utilisateur

---

## 3. Stack technique

### Framework & langage

| Couche | Technologie | Version |
|---|---|---|
| Framework | **Next.js** (App Router, Turbopack) | 16.2 |
| Runtime React | **React** (Server Components) | 19.2 |
| Langage | **TypeScript** strict | 5.x |

### Persistance & ORM

| Couche | Technologie |
|---|---|
| Base de données | **MySQL 8** (hébergée sur Railway) |
| ORM | **Prisma 7** |
| Adapter | `@prisma/adapter-mariadb` (driver compatible MySQL/MariaDB) |

### Authentification

| Couche | Technologie |
|---|---|
| Lib auth | **NextAuth v4** (JWT strategy) |
| Hash mot de passe | **bcryptjs** (10 rounds) |
| Stratégie | `CredentialsProvider` (email + mot de passe) |
| Reset password | Token unique en base + expiration 1h + envoi email |

### UI / Front

| Couche | Technologie |
|---|---|
| Styling | **Tailwind CSS v4** |
| Composants headless | **Base UI** (`@base-ui/react`) |
| Icônes | **Lucide React** |
| Animations | **Framer Motion** |
| Variants CSS | **class-variance-authority** |
| State management | **Zustand** (avec middleware `persist`) |

### Validation & utilitaires

- **Zod** — validation runtime des payloads API
- **Nodemailer** — envoi d'emails via SMTP Gmail
- **Cloudinary** — stockage et transformation d'images

---

## 4. Architecture globale

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    Navigateur (client)                       │
│   React 19 · Zustand (cart/favs persistés en localStorage)   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / JSON
┌────────────────────────▼────────────────────────────────────┐
│              Next.js 16 (App Router, déployé Vercel)         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Server       │  │ Route        │  │ Middleware       │   │
│  │ Components   │  │ Handlers     │  │ (proxy.ts)       │   │
│  │ (SEO, SSR)   │  │ /api/*       │  │ guard /admin/*   │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
└─────────┼─────────────────┼───────────────────┼─────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
   ┌────────────┐    ┌────────────┐      ┌────────────┐
   │  Prisma    │    │ Cloudinary │      │  SMTP      │
   │  MySQL     │    │  (images)  │      │  Gmail     │
   │  Railway   │    └────────────┘      └────────────┘
   └────────────┘
```

### Pattern d'architecture

- **App Router de Next.js** : la totalité du routage et du rendu se fait via la structure `src/app/`.
- **Server Components par défaut** : les pages publiques (`/`, `/products`, `/categories/*`) sont rendues côté serveur, ce qui permet :
  - du SEO solide (HTML pré-rendu)
  - moins de JavaScript expédié au client
  - accès direct à Prisma sans couche API intermédiaire
- **Client Components ciblés** : uniquement les zones interactives (panier, formulaires, admin) — marquées `"use client"`.
- **Route Handlers** (`src/app/api/**/route.ts`) : exposent une API REST sans framework supplémentaire, validation Zod + gestion d'erreurs centralisée dans `@/lib/api-helpers.ts`.
- **Middleware `proxy.ts`** : intercepte les requêtes vers `/admin/*`, `/orders/*`, `/profile/*` et vérifie l'authentification + le rôle.

### Organisation du code

```
src/
├── app/                    # Routes (App Router)
│   ├── (auth)/             # login, register, reset, forgot-password
│   ├── admin/              # back-office (protégé par middleware)
│   ├── api/                # route handlers (REST)
│   ├── products/           # catalogue + fiche produit
│   ├── categories/         # listing par catégorie
│   ├── cart/, checkout/    # tunnel de commande
│   └── ...
├── components/             # UI réutilisable (composants shadcn-style)
├── hooks/                  # useToast, useConfirm, ...
├── lib/                    # auth, prisma, schemas Zod, helpers
├── store/                  # stores Zustand (cart, favorites)
└── proxy.ts                # middleware de protection des routes
```

---

## 5. Services externes utilisés

| Service | Rôle | Justification du choix |
|---|---|---|
| **Railway** | Hébergement MySQL | Setup en 1 clic, free tier suffisant pour un MVP, latence acceptable depuis Vercel |
| **Vercel** | Hébergement de l'application Next.js | Intégration native Next.js, déploiement Git, CDN global, free tier généreux |
| **Cloudinary** | Stockage + optimisation images | CDN intégré, transformations à la volée (resize, format auto webp/avif), free tier de 25 GB, suppression atomique des images orphelines |
| **Gmail SMTP** | Envoi d'emails transactionnels | Gratuit, fiable, configuration via mot de passe d'application. Limite : ~500 mails/jour |
| **NextAuth** | Gestion de session JWT | Standard de facto pour Next.js, supporte multi-provider, intégration simple |

### Ce que le projet n'utilise PAS (volontairement)

- **Aucune passerelle de paiement** (Stripe, CinetPay, Orange Money…) — le modèle économique est **cash à la livraison**.
- **Pas de Redis** — le rate limiting est en mémoire (suffisant pour single-instance).
- **Pas d'OAuth Google/Facebook** — l'UI est prévue mais désactivée (toast "bientôt disponible"). Cf. section "Limites".

---

## 6. Base de données

### Schéma (8 modèles)

```
┌──────────┐         ┌──────────┐         ┌──────────────┐
│   User   │1─────*  │  Order   │ *─────1 │  OrderItem   │ *──1 ┌─────────┐
└──────────┘         └──────────┘         └──────────────┘      │ Product │
     │  1                                                       └─────────┘
     │                                                              │  1
     │                                                              │
     │  *                                                           │  *
┌──────────┐                                          ┌──────────┐  │
│  Review  │*───────────────────────────────────────1 │ Category │  │
└──────────┘                                          └──────────┘  │
                                                                    │
                                          ┌─────────┐               │
                                          │ Setting │   (singleton) │
                                          └─────────┘               │
```

### Tables principales

| Table | Rôle | Particularités |
|---|---|---|
| `User` | Comptes utilisateurs | `role` (ADMIN/CLIENT), `resetToken` pour reset password |
| `Category` | Catégories de produits | `slug` unique, image Cloudinary optionnelle |
| `Product` | Produits du catalogue | `isActive` (soft delete), `images` JSON (galerie), `imagePublicId` pour suppression Cloudinary |
| `Order` | Commandes | Status enum, **snapshot** du `totalAmount` et `shippingCost` au moment de la commande |
| `OrderItem` | Lignes de commande | **Snapshot** du `unitPrice` (le prix produit peut changer plus tard) |
| `Review` | Avis produit | Contrainte `@@unique([userId, productId])` (1 avis par user par produit) |
| `Setting` | Configuration globale | Singleton, gérée via `/admin/settings` |

### Index stratégiques

- `Product` : index sur `categoryId`, `slug`, `isActive`, `isFeatured`, `isNew` → recherches rapides côté boutique
- `Order` : index sur `userId`, `status`, `createdAt` → admin filtre et trie ces colonnes
- `Review` : index composé pour empêcher les doublons

### Décisions de modélisation importantes

1. **Snapshot des prix dans `OrderItem`** : si le prix d'un produit change, les anciennes commandes conservent le prix payé. Indispensable pour la comptabilité et l'historique client.

2. **Snapshot des frais de livraison dans `Order`** : ajouté en cours de projet. Permet à l'admin de changer les frais (`Setting.shippingCost`) sans affecter les commandes existantes.

3. **Soft delete via `isActive` sur `Product`** : la suppression réelle n'est possible que si aucun `OrderItem` ne référence le produit. Sinon désactivation automatique pour préserver l'historique.

4. **Pas de table `Address` séparée** : l'adresse est dénormalisée dans `Order` (addressLine, city, longitude, latitude). Justifié car (a) une commande est immuable, (b) un utilisateur peut livrer à différentes adresses.

5. **`Decimal(10,2)` pour les prix** : pas de calcul en float (évite les erreurs d'arrondi en virgule flottante).

---

## 7. Sécurité et permissions

### Authentification

- **NextAuth JWT** : la session est portée par un JWT signé avec `NEXTAUTH_SECRET`, transmis via cookie HTTP-only
- **bcrypt 10 rounds** pour le hash des mots de passe (jamais stockés en clair)
- **Reset password** : token aléatoire avec **expiration 1h**, à usage unique (effacé après utilisation)

### Autorisation

Architecture en **trois couches** de défense :

1. **Middleware** (`src/proxy.ts`) : bloque l'accès aux pages `/admin/*`, `/orders/*`, `/profile/*` si non authentifié, et redirige les non-ADMIN qui tentent d'accéder à `/admin`.
2. **Helpers serveur** (`requireUser()`, `requireAdmin()` dans `api-helpers.ts`) : chaque route handler sensible vérifie le rôle avant d'exécuter quoi que ce soit.
3. **Vérifications métier** : ex. un utilisateur ne peut voir/modifier QUE ses propres commandes (filtre par `userId` dans les requêtes Prisma).

### Validation des entrées

- **100 % des payloads API** sont validés avec **Zod** via `parseJson(request, schema)` (`@/lib/schemas.ts`)
- Empêche injections, types invalides, longueurs excessives
- Erreurs structurées renvoyées au client avec détails

### Rate limiting

- Limite **10 tentatives / 15 min** par email sur le login
- Limite par IP sur les routes register, forgot-password, contact, reviews
- Implémentation **in-memory** avec sliding window (`@/lib/rate-limit.ts`)
- ⚠️ Cette implémentation suppose **une seule instance** du serveur. Documentée comme remplaçable par Upstash Redis (`@upstash/ratelimit`) sans changer l'API.

### Autres protections

- **Cookies HTTP-only** (NextAuth) → impossibles à lire en JS, protection contre XSS
- **CSRF** : géré par NextAuth (token CSRF natif)
- **Variables d'environnement** : aucune clé ne fuit dans le bundle client (préfixe `NEXT_PUBLIC_` seulement pour `CLOUDINARY_CLOUD_NAME`)
- **Cloudinary uploads** : signés côté serveur, le client ne peut pas uploader directement

---

## 8. Mode offline et synchronisation

### Ce qui fonctionne offline

- **Panier** : items + quantités stockés dans `localStorage` via Zustand `persist` (clé `eburnie-cart`)
- **Favoris** : même mécanisme (clé `eburnie-favorites`)
- → l'utilisateur peut consulter et modifier son panier sans connexion
- → à la reconnexion, le panier est tel qu'il l'a laissé sur le même appareil

### Ce qui ne fonctionne PAS offline

- Le catalogue n'est pas servi depuis un cache offline (pas de Service Worker pour l'instant)
- Passer une commande nécessite la connexion (validation stock + email + persistance en base)

### Stratégie de synchronisation

- **Pas de sync inter-appareils** : le panier d'un utilisateur sur son téléphone n'est pas le même que sur son ordi.
- **Justification** : pour une cible e-commerce occasionnelle, la complexité (table `Cart` côté serveur + résolution de conflits + push notifications) n'apporte pas assez de valeur par rapport au coût de développement.
- **Évolution possible** : à la connexion, synchroniser le panier local avec une table serveur. Détaillé dans la section "Limites".

---

## 9. Déploiement et hébergement

### Environnements

| Environnement | Hébergement | Branche |
|---|---|---|
| **Production** | Vercel | `main` (déploiement auto à chaque push) |
| **Base de données** | Railway (MySQL) | Singleton (pas de staging séparé) |
| **Images** | Cloudinary | Compte unique, prefix `seed/` pour différencier |

### Pipeline de build

```
git push main
   ↓
Vercel détecte le commit
   ↓
yarn install
   ↓
yarn build  (= prisma generate && next build)
   ↓
Type check TypeScript
   ↓
Compilation Next.js (Turbopack)
   ↓
Déploiement edge + CDN
   ↓
Production accessible
```

### Variables d'environnement (production)

```env
DATABASE_URL=mysql://...              # Railway
NEXTAUTH_SECRET=<32+ chars>           # signature JWT
NEXTAUTH_URL=https://...              # URL publique
CLOUDINARY_API_KEY / SECRET           # auth Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME     # côté client (lecture seule)
EMAIL=<gmail>                         # SMTP
APPLICATION_PASSWORD=<app password>   # mot de passe d'application Gmail
```

### Stratégie de migration de schéma

- `npx prisma migrate dev --name <description>` en local
- Les fichiers de migration sont commités dans `prisma/migrations/`
- En production : `prisma migrate deploy` (ou Vercel applique les migrations au build)
- **Seed** : `npx prisma db seed` exécute `prisma/seed.ts` (admin, settings, catégories, produits initiaux)

---

## 10. Choix techniques et justifications

| Choix | Justification |
|---|---|
| **Next.js App Router** | Server Components = HTML rendu côté serveur = SEO immédiat + moins de JS. Idéal pour un e-commerce où le catalogue doit être indexable. |
| **MySQL plutôt que PostgreSQL** | Railway proposait MySQL en free tier illimité. PostgreSQL aurait fonctionné aussi, mais MySQL est largement suffisant pour le besoin (pas de features avancées de Postgres requises). |
| **Prisma plutôt que TypeORM/Drizzle** | Typage généré automatiquement, écosystème mature, migrations déclaratives, queries plus lisibles. |
| **NextAuth v4 plutôt que v5/Auth.js** | v4 stable, v5 encore en beta au moment du développement. Migration possible en gardant la même API publique. |
| **Zustand plutôt que Redux/Context API** | API minimaliste, middleware `persist` built-in, pas de boilerplate. Pour un panier + favoris, Redux serait sur-dimensionné. |
| **Cloudinary plutôt que S3** | Transformations d'images intégrées (resize, format auto), CDN inclus, free tier. Avec S3 il aurait fallu ajouter CloudFront + Lambda + ImageOptim. |
| **Tailwind v4 + Base UI** | Tailwind = vélocité de dev. Base UI = composants accessibles (a11y) sans styles imposés. |
| **Paiement à la livraison uniquement** | Choix business adapté au marché ivoirien : faible bancarisation, méfiance vis-à-vis du paiement en ligne, habitudes locales. |
| **Pas de tests automatisés** | Choix assumé sur MVP. À ajouter avant montée en charge (cf. limites). |

---

## 11. Limites actuelles du projet

### Limites fonctionnelles

| Limite | Impact | Évolution possible |
|---|---|---|
| **Pas de paiement en ligne** | Risque de commandes non honorées au moment de la livraison | Intégrer CinetPay ou Orange Money en option |
| **Pas de gestion multi-vendeurs** | C'est un mono-shop, pas une marketplace | Ajouter modèle `Vendor` + relation Product→Vendor |
| **Pas de gestion d'inventaire avancée** | Pas de variantes (taille/couleur), pas de SKU multiples | Ajouter modèle `ProductVariant` |
| **Pas de coupons / promotions** | Pas de codes promo (l'input avait été retiré faute de logique back) | Ajouter modèle `Coupon` + validation à la commande |
| **Pas de gestion des retours** | Commande livrée = définitive | Ajouter statut `RETURNED` + workflow |
| **Pas de notifications push / SMS** | Le client doit consulter ses emails pour le suivi | Twilio SMS ou push web pour mobiles |
| **OAuth Google désactivé** | Friction lors de l'inscription | Activer `GoogleProvider` (UI déjà prête) |

### Limites techniques

| Limite | Impact | Mitigation |
|---|---|---|
| **Rate limit in-memory** | Ne fonctionne qu'en single-instance (scaling horizontal cassé) | Migrer vers Upstash Redis (`@upstash/ratelimit`) — API identique |
| **Pas de tests** | Risque de régression invisible | Ajouter Vitest + Playwright (priorité aux flows critiques : login, checkout) |
| **Pas de monitoring d'erreurs** | Une erreur en prod n'est vue que dans les logs Vercel | Brancher Sentry (free tier généreux) |
| **Email via Gmail SMTP** | Limite ~500 emails/jour, deliverability moyenne | Migrer vers Resend / SendGrid (free tier 100/jour mais meilleur deliverability) |
| **Pas de queue de jobs** | L'email de confirmation bloque la réponse de commande | Acceptable car non-bloquant (try/catch), mais Inngest ou BullMQ amélioreraient la fiabilité |
| **Search basique (LIKE)** | Recherche peu pertinente sur gros catalogue | Migrer vers Meilisearch ou Algolia |
| **Pas de cache HTTP** | Chaque requête refait les queries DB | Ajouter `revalidate` ou `unstable_cache` sur les pages catalogue |

### Limites de scalabilité

- **Single instance** : pas conçu pour de l'horizontal scaling (rate limit, sessions JWT OK mais cache local KO)
- **Pas de CDN d'API** : les routes `/api/*` ne sont pas mises en cache
- **Connexions DB** : `connectionLimit: 5` dans le pool Prisma. Suffisant pour un trafic modéré (~50 req/s simultanées), à augmenter pour plus.

---

## 12. Questions techniques difficiles + réponses

### Q1 — Pourquoi pas un BaaS comme Supabase ou Firebase ?

**Réponse :**
> J'ai préféré une stack composée pour garder la maîtrise totale du backend. Avec Prisma + une base MySQL gérée, je peux écrire exactement les queries dont j'ai besoin, optimiser les index, et migrer le projet vers un autre hébergeur en quelques heures. Supabase aurait été plus rapide à démarrer mais m'aurait verrouillé sur ses conventions et son tarif. Sur un projet où la maîtrise du modèle de données est critique (snapshots de prix, soft delete conditionnel, etc.), j'estime que la flexibilité gagnée vaut le temps de setup initial.

### Q2 — Comment gérez-vous la cohérence du stock lors d'une commande ?

**Réponse :**
> Tout passe par une **transaction Prisma** (`prisma.$transaction`) :
> 1. Vérification que tous les produits existent et sont actifs
> 2. Vérification du stock disponible pour chaque ligne
> 3. Décrément atomique du stock
> 4. Création de la commande + items
>
> Si une étape échoue, la transaction est rollback intégralement — aucun risque d'avoir une commande créée sans décrément de stock, ou inversement. Lors d'une annulation par l'admin, on fait l'opération inverse : un script restaure le stock en réincrémentant chaque ligne.

### Q3 — Comment empêchez-vous un utilisateur de modifier la commande d'un autre ?

**Réponse :**
> Trois niveaux de défense :
> 1. **Middleware Next.js** : redirige vers le login si pas de session
> 2. **`requireUser()` côté API** : valide la session JWT
> 3. **Filtre Prisma** : toute query `Order.findUnique` ou `findMany` inclut un `where: { userId: session.user.id }`. Même si l'utilisateur force un ID dans l'URL, Prisma renverra `null` et l'API renverra 404.
>
> Cette stratégie de "**defense in depth**" est volontaire : si un niveau saute, les autres tiennent.

### Q4 — Pourquoi des snapshots dans `OrderItem` et `Order` ?

**Réponse :**
> Parce qu'une commande est un **objet immuable** dans le temps. Si demain le produit X passe de 10 000 à 15 000 FCFA, une commande passée hier au prix de 10 000 doit toujours afficher 10 000. Idem pour les frais de livraison : l'admin peut les changer dans les settings, mais les commandes existantes conservent les frais payés. C'est une exigence comptable et légale (un client ne peut pas se voir réclamer un complément a posteriori).

### Q5 — Que se passe-t-il si on supprime un produit qui a déjà été commandé ?

**Réponse :**
> Le DELETE est intelligent. Avant de supprimer, on compte les `OrderItem` qui référencent ce produit :
> - **Si zéro** → suppression réelle + suppression de l'image Cloudinary associée (via `imagePublicId`)
> - **Si > 0** → désactivation via `isActive = false`. Le produit disparaît du catalogue public et ne peut plus être commandé, mais l'historique reste intact.
>
> Le côté admin affiche un badge "Masqué" et un toast explicite le comportement. C'est une approche **soft delete conditionnel** qui combine le meilleur des deux mondes.

### Q6 — Comment scalez-vous si vous avez 10 000 utilisateurs simultanés ?

**Réponse :**
> Honnêtement, dans l'état actuel ça ne passerait pas. Trois choses bloqueraient :
> 1. Le **rate limit in-memory** — il faudrait passer à Upstash Redis (changement d'une ligne grâce à l'abstraction)
> 2. La **base MySQL Railway** sur free tier — il faudrait soit upgrader, soit migrer vers PlanetScale / RDS
> 3. Les **routes API non cachées** — il faudrait revalider à 60s les pages catalogue et utiliser `unstable_cache` pour les queries lourdes
>
> Avec ces trois changements, l'architecture Vercel + base externe scale horizontalement sans soucis jusqu'à plusieurs milliers d'utilisateurs concurrent. Au-delà, il faut séparer le backend des Server Components et passer sur du Kubernetes, mais ce n'est pas le besoin du projet aujourd'hui.

### Q7 — Pourquoi pas de tests ?

**Réponse :**
> Choix assumé pour le MVP. Sur un délai contraint, j'ai préféré itérer rapidement sur les fonctionnalités et le modèle de données plutôt que de figer des tests qui auraient été cassés à chaque refactor. **C'est une dette technique consciente.** Maintenant que le modèle est stable, la priorité serait d'ajouter :
> 1. Tests unitaires sur les helpers (`auth`, `rate-limit`, validators Zod)
> 2. Tests d'intégration sur les routes API critiques (commande, login, reset password)
> 3. Tests E2E Playwright sur le tunnel checkout
>
> Je viserais 70-80 % de couverture sur les flows métier, pas 100 % partout.

### Q8 — Comment gérez-vous les uploads d'images ?

**Réponse :**
> Tout passe par Cloudinary :
> 1. Le client envoie les fichiers à `/api/admin/upload` (route admin uniquement)
> 2. Le serveur valide le type MIME, la taille, puis upload via le SDK Cloudinary
> 3. Cloudinary renvoie `{ url, publicId }` qu'on stocke en base
> 4. À la suppression, on supprime aussi l'image Cloudinary via `publicId` (évite les images orphelines)
>
> Les transformations (redimensionnement, format auto webp/avif) sont faites à la volée par Cloudinary via l'URL. On ne stocke jamais l'image originale dans notre base, juste son URL CDN.

### Q9 — Sécurité du reset de mot de passe ?

**Réponse :**
> Le flow est :
> 1. Utilisateur saisit son email → on génère un `resetToken` aléatoire (cuid) + `resetTokenExpiry = now + 1h`
> 2. On envoie un email avec le lien `/reset-password?token=<token>`
> 3. À la soumission du nouveau mot de passe, on vérifie : token existe, non expiré, on hash le nouveau mot de passe, on efface le token
>
> Garde-fous :
> - Token **unique** (contrainte DB) et à **usage unique** (effacé après usage)
> - **Expiration 1h** (court mais suffisant)
> - **Rate limit** sur la route forgot-password pour empêcher le spam
> - **Pas d'indication si l'email existe ou non** dans la réponse (anti-enum)

### Q10 — Pourquoi NextAuth v4 alors que v5/Auth.js existe ?

**Réponse :**
> Au moment du développement, Auth.js (v5) était encore en beta avec une API qui évoluait. NextAuth v4 est mature, documenté, stable, et résout 100 % de mon besoin (JWT, credentials, callbacks personnalisés). La migration vers v5 est prévue mais pas urgente : l'API publique reste très proche, le coût de migration est faible.

### Q11 — Comment gérez-vous les fuseaux horaires ?

**Réponse :**
> Toutes les dates sont stockées en **UTC** en base (comportement par défaut de Prisma + MySQL avec `DateTime`). L'affichage côté client se fait via `toLocaleString('fr-FR')` qui applique automatiquement le fuseau du navigateur. C'est suffisant pour un service en Côte d'Ivoire (un seul fuseau) — pour une plateforme multi-pays il faudrait stocker le fuseau de l'utilisateur en plus.

### Q12 — Que se passe-t-il si l'envoi d'email échoue ?

**Réponse :**
> L'envoi est volontairement **non-bloquant** dans le flux de commande : le `try/catch` autour de `sendEmail` n'interrompt pas la création de la commande. La commande est enregistrée en base, le client voit la page de confirmation, et seul l'email peut échouer silencieusement. Cette approche évite qu'une panne SMTP empêche les commandes. Un système de retry (queue Inngest ou cron) serait l'évolution naturelle pour garantir la livraison à 100 %.

### Q13 — Comment se prémunir d'une attaque DDoS ?

**Réponse :**
> Première ligne : **Vercel** absorbe automatiquement les requêtes via son CDN/edge network et limite par défaut le trafic anormal. Deuxième ligne : mon **rate limit** custom protège les routes coûteuses (login, register, reset, contact, reviews). En cas d'attaque ciblée, je remonterais le seuil de Vercel et passerais le rate limit sur Redis (Upstash) pour cohérence multi-instance. Pour une protection avancée, Cloudflare en amont de Vercel ajouterait une couche WAF.

### Q14 — Pourquoi MySQL plutôt que PostgreSQL ?

**Réponse :**
> Honnêtement, c'est principalement parce que **Railway proposait MySQL** dans son free tier au moment du setup. Sur le périmètre du projet, je n'utilise aucune feature spécifique à Postgres (pas de JSONB indexé avancé, pas de full-text search, pas d'extensions). Prisma rend les deux interchangeables — un changement de provider serait une question de configuration. Si je devais reprendre le projet à zéro, je prendrais probablement Postgres pour ses features avancées (JSONB, partial indexes, full-text), mais ce n'est pas un blocage actuel.

### Q15 — Comment gérez-vous l'accessibilité ?

**Réponse :**
> Trois piliers :
> 1. **Base UI** comme bibliothèque de composants : tous les composants sont accessibles par défaut (focus, ARIA, navigation clavier)
> 2. **Sémantique HTML** : usage strict de `<button>`, `<nav>`, `<main>`, `<label htmlFor>` partout
> 3. **Contrastes** : la charte respecte WCAG AA (vérifié manuellement, pas d'audit automatisé encore)
>
> Marge d'amélioration : audits Lighthouse/axe automatisés dans le CI, et test au lecteur d'écran (NVDA / VoiceOver).

---

## 13. Erreurs / points faibles potentiels et comment les justifier

### Point 1 — "Vous n'avez aucun test automatisé"

**À répondre :** "C'est une dette technique consciente que j'ai assumée pour livrer le MVP dans les délais. Le modèle de données et les flows critiques sont stables maintenant, donc la prochaine itération inclut les tests d'intégration et E2E (cf. Q7)."

### Point 2 — "Le rate limit en mémoire est inutilisable en production scalée"

**À répondre :** "Vous avez raison, et c'est documenté dans le code (`rate-limit.ts`). L'API a été pensée pour être remplaçable par Upstash Redis sans toucher aux call sites. C'est un investissement de quelques heures, pas un refactor."

### Point 3 — "Vous stockez des mots de passe Gmail dans `.env` en clair"

**À répondre :** "Ce sont des **mots de passe d'application** Gmail, pas mon mot de passe Google personnel. Ils sont révocables individuellement et limités au SMTP. En production sur Vercel, ils sont chiffrés au repos dans les Environment Variables. Pour un projet plus sérieux, je migrerais vers un service transactionnel (Resend, Postmark) avec une API key dédiée."

### Point 4 — "Pourquoi pas de paiement en ligne, c'est risqué le cash"

**À répondre :** "C'est un **choix business assumé adapté au marché**. Plus de 60 % des Ivoiriens n'ont pas de carte bancaire et le taux de bancarisation reste faible. Imposer un paiement en ligne diviserait la clientèle accessible par 3. Le risque de commandes non honorées existe, mais (a) le client doit donner un numéro de téléphone validé, (b) l'admin appelle pour confirmer avant l'expédition, (c) à terme une intégration optionnelle Mobile Money (Orange Money, MTN) serait pertinente."

### Point 5 — "Les Server Components vous empêchent d'avoir un état réactif global"

**À répondre :** "Au contraire, c'est complémentaire. Les Server Components rendent l'HTML initial (catalogue, fiches produit), et les Client Components gèrent l'interactivité (panier Zustand, formulaires, admin). Le panier est persistant côté client, hydraté immédiatement après le mount, sans flash. C'est exactement le pattern que recommande l'équipe Next.js."

### Point 6 — "Pas d'observabilité, comment savez-vous si la prod a un problème ?"

**À répondre :** "Aujourd'hui : logs Vercel + alertes Railway sur la DB. C'est insuffisant pour un service critique, je le concède. Mon plan : Sentry pour les erreurs runtime (free tier 5k events/mois), Vercel Analytics pour les Web Vitals, et à terme un dashboard Grafana si le projet grandit."

### Point 7 — "Votre code admin (suppression, etc.) utilise `confirm()` natif… Ah non, vous l'avez remplacé"

**À répondre :** "Précisément, c'était un point faible que j'ai refactoré : j'ai créé un hook `useConfirm()` qui expose une API impérative `await confirm({...})` retournant `Promise<boolean>`, basée sur le composant `Dialog`. Les 7 occurrences de `confirm()` natif ont été remplacées en gardant la même logique d'arrêt précoce dans les handlers. Toutes les actions destructives ont aussi un variant rouge avec icône d'alerte."

### Point 8 — "Le bundle JS est-il optimisé ?"

**À répondre :** "Next.js 16 avec Turbopack fait le code splitting automatiquement par route. Les Server Components ne shippent pas de JS au client (toute la logique de queries Prisma reste serveur). Framer Motion est un peu lourd (~80kb) mais je l'ai gardé pour la fluidité UX. Pour optimiser plus, je pourrais lazy-load les motions et passer sur `react-spring` plus léger, mais l'impact perceptible serait minime."

---

## 14. Métriques actuelles (état du projet)

| Métrique | Valeur |
|---|---|
| Lignes de code TypeScript | ~12 000 lignes |
| Modèles Prisma | 7 + 1 enum |
| Routes API | 28 endpoints |
| Pages publiques | 12+ |
| Pages admin | 8+ |
| Composants UI | ~30 |
| Migrations Prisma | ~6 |
| Temps de build moyen | ~25-30 s |

---

## 15. Conclusion

Eburnie est un projet e-commerce **complet, fonctionnel et déployé** qui couvre tout le cycle de vie d'une commande, du catalogue à la livraison, avec un back-office riche. Les choix techniques privilégient la **simplicité, la robustesse et la maîtrise** plutôt que la complexité gratuite.

Les limites identifiées (tests, observabilité, scalabilité horizontale) ne sont pas des oublis mais des **décisions documentées**, avec un plan d'évolution clair pour chaque sujet. Le code est structuré pour permettre une montée en gamme sans refactor majeur — c'est l'aspect le plus important d'un MVP réussi : ne pas se peindre dans un coin.

Le projet est **prêt pour une mise en production** sur un volume modéré (jusqu'à quelques milliers d'utilisateurs/mois) et constitue une base solide pour évolutions futures (paiement Mobile Money, multi-langue, app mobile React Native partageant l'API REST).
