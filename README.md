# Eburnie

Plateforme e-commerce moderne pour le marché ivoirien, développée avec Next.js 16, Prisma et MySQL.

## 🚀 Fonctionnalités

### Client
- **Catalogue produits** avec filtres et recherche
- **Panier** avec gestion des quantités
- **Favoris** (liste de souhaits)
- **Commande** avec paiement à la livraison
- **Suivi de commande** en temps réel
- **Profil utilisateur** avec historique
- **Formulaire de contact**

### Administration
- **Gestion produits** (création, modification, suppression)
- **Gestion catégories**
- **Gestion commandes** avec statuts
- **Tableau de bord** avec statistiques
- **Paramètres du site** (contact, slogan, localisation)
- **Images hébergées** sur Cloudinary

### Authentification
- Inscription utilisateur
- Connexion (email/mot de passe)
- **Mot de passe oublié** avec envoi d'email
- **Réinitialisation de mot de passe**

## 🛠️ Stack Technique

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript
- **Base de données** : MySQL (Prisma ORM)
- **Authentification** : NextAuth.js
- **Hébergement images** : Cloudinary
- **Email** : Nodemailer (Gmail SMTP)
- **UI Components** : shadcn/ui
- **Styling** : Tailwind CSS
- **Animations** : Framer Motion
- **State Management** : Zustand (panier, favoris)
- **Form Validation** : Zod

## 📦 Installation

### Prérequis
- Node.js 20+
- Yarn
- MySQL

### Cloner le projet

```bash
git clone <repository-url>
cd Fyle-e_market
```

### Installer les dépendances

```bash
yarn install
```

### Configuration des variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL="mysql://user:password@localhost:3306/eburnie"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Gmail SMTP)
EMAIL="your-email@gmail.com"
APPLICATION_PASSWORD="your-app-password"
```

### Base de données

Générer le client Prisma :

```bash
npx prisma generate
```

Pousser le schéma vers la BDD :

```bash
npx prisma db push
```

## 🏃 Démarrer le projet

```bash
yarn dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

## 📁 Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Pages d'authentification
│   ├── admin/             # Administration
│   ├── api/               # Routes API
│   └── layout.tsx         # Layout racine
├── components/            # Composants React
│   ├── layout/           # Header, Footer, CartDrawer
│   ├── home/             # Sections de la page d'accueil
│   ├── ui/               # Composants shadcn/ui
│   └── providers.tsx     # Providers (Session, Toaster)
├── lib/                  # Utilitaires
│   ├── auth.ts          # Configuration NextAuth
│   ├── email.ts         # Envoi d'emails
│   ├── prisma.ts        # Client Prisma
│   ├── schemas.ts       # Validation Zod
│   └── serializers.ts   # Sérialiseurs
├── store/               # Zustand stores
│   ├── cart-store.ts    # État du panier
│   └── favorites-store.ts # État des favoris
└── hooks/               # Custom hooks
    └── use-toast.ts     # Toast notifications
```

## 🔐 Comptes par défaut

**Admin** :
- Email : (à configurer dans la BDD)
- Mot de passe : (à configurer)

Pour créer un compte admin, définir `role: "ADMIN"` dans la table `User` via Prisma Studio.

## 🚀 Déploiement

### Railway (MySQL + App)

1. Connecter le projet à Railway
2. Configurer les variables d'environnement
3. Déployer avec `yarn build`

### Vercel (Frontend uniquement)

1. Connecter le repo à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

## 📝 Notes importantes

- **Tables Order/OrderItem** : Renommées en `orders`/`order_items` pour éviter les conflits avec le mot réservé MySQL
- **Livraison** : Frais fixes à 2 500 FCFA (pas de livraison gratuite)
- **Email** : Configuration SMTP Gmail requise pour le mot de passe oublié
- **Images** : Upload via Cloudinary

## 🔧 Commandes utiles

```bash
# Développement
yarn dev

# Build pour production
yarn build

# Lancer en production
yarn start

# Prisma
npx prisma studio          # Interface BDD
npx prisma generate        # Générer client
npx prisma db push         # Pousser schéma
npx prisma db seed         # Seeding (si configuré)
```

## 📄 Licence

Ce projet est propriétaire.

## 👥 Auteurs

Développé pour Dingui Beda Junior - Plateforme e-commerce ivoirienne. 
