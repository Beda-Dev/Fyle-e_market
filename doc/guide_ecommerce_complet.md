# Guide Technique Complet — E-Commerce Next.js (Recrutement)

> Stack : Next.js · Railway (MySQL) · Prisma · Cloudinary · Vercel · NextAuth.js

---

## Table des matières

1. [Schéma de base de données (Prisma)](#1-schéma-de-base-de-données-prisma)
2. [Configuration initiale du projet](#2-configuration-initiale-du-projet)
3. [Authentification — NextAuth.js avec rôles](#3-authentification--nextauthjs-avec-rôles)
4. [Middleware de protection des routes](#4-middleware-de-protection-des-routes)
5. [Upload d'images — Cloudinary](#5-upload-dimages--cloudinary)
6. [API Routes — CRUD Produits](#6-api-routes--crud-produits)
7. [Logique panier côté client](#7-logique-panier-côté-client)
8. [API Routes — Commandes](#8-api-routes--commandes)
9. [Dashboard Admin](#9-dashboard-admin)
10. [Seed de données de démo](#10-seed-de-données-de-démo)
11. [Validation avec Zod](#11-validation-avec-zod)
12. [Déploiement Vercel](#12-déploiement-vercel)
13. [Structure des maquettes Figma](#13-structure-des-maquettes-figma)
14. [README de présentation](#14-readme-de-présentation)

---

## 1. Schéma de base de données (Prisma)

### Fichier `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  // Railway supporte les vraies foreign keys — pas besoin de relationMode
}

// ─── Rôles utilisateur ───────────────────────────────────────────────────────

enum Role {
  ADMIN
  CLIENT
}

// ─── Statuts d'une commande ──────────────────────────────────────────────────

enum OrderStatus {
  PENDING      // En attente (commande passée, pas encore traitée)
  CONFIRMED    // Confirmée par l'admin
  SHIPPED      // Expédiée
  DELIVERED    // Livrée (paiement en espèces effectué)
  CANCELLED    // Annulée
}

// ─── Utilisateur ─────────────────────────────────────────────────────────────

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // hashé avec bcrypt
  name      String
  role      Role     @default(CLIENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  orders    Order[]

  @@index([email])
}

// ─── Catégorie produit ────────────────────────────────────────────────────────

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  products  Product[]
  createdAt DateTime  @default(now())

  @@index([slug])
}

// ─── Produit ──────────────────────────────────────────────────────────────────

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)  // prix en devise locale
  stock       Int      @default(0)
  imageUrl    String   // URL Cloudinary
  imagePublicId String  // public_id Cloudinary (pour suppression)
  isActive    Boolean  @default(true)      // permet de désactiver sans supprimer

  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id])

  orderItems  OrderItem[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
  @@index([slug])
  @@index([isActive])
}

// ─── Commande ─────────────────────────────────────────────────────────────────

model Order {
  id          String      @id @default(cuid())
  status      OrderStatus @default(PENDING)
  totalAmount Decimal     @db.Decimal(10, 2) // snapshot du total au moment de la commande

  // Adresse de livraison (snapshot — indépendante du profil utilisateur)
  addressLine String
  city        String
  phone       String

  // Note optionnelle du client
  note        String?     @db.Text

  userId      String
  user        User        @relation(fields: [userId], references: [id])

  items       OrderItem[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

// ─── Ligne de commande ────────────────────────────────────────────────────────

model OrderItem {
  id        String  @id @default(cuid())
  quantity  Int
  unitPrice Decimal @db.Decimal(10, 2) // snapshot du prix au moment de la commande

  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])

  productId String
  product   Product @relation(fields: [productId], references: [id])

  @@index([orderId])
  @@index([productId])
}
```

### Pourquoi ces choix ?

| Choix | Raison |
|---|---|
| Railway MySQL | Supporte les vraies foreign keys, pas besoin de `relationMode = "prisma"` |
| `Decimal` pour les prix | `Float` introduit des erreurs d'arrondi sur les montants financiers |
| `imagePublicId` sur Product | Nécessaire pour supprimer l'image Cloudinary quand on supprime/modifie le produit |
| `unitPrice` dans `OrderItem` | Le prix d'un produit peut changer, la commande doit garder le prix d'achat original |
| `addressLine` sur `Order` | L'adresse de livraison est un snapshot — si l'utilisateur change son adresse, les anciennes commandes restent cohérentes |
| `isActive` sur `Product` | Permet de "cacher" un produit sans perdre les données historiques des commandes |

### Commandes Prisma utiles

```bash
# Générer le client après modification du schéma
yarn prisma generate

# Pousser le schéma vers Railway
yarn prisma db push

# Ouvrir Prisma Studio (interface visuelle)
yarn prisma studio

# Lancer le seed
yarn prisma db seed
```

---

## 2. Configuration initiale du projet

### Création du projet

```bash
yarn create next-app ecommerce-app --typescript --tailwind --eslint --app
cd ecommerce-app
```

### Installation des dépendances

```bash
# ORM et base de données
yarn add @prisma/client prisma

# Authentification
yarn add next-auth bcryptjs
yarn add -D @types/bcryptjs

# Validation
yarn add zod

# Upload Cloudinary
yarn add cloudinary next-cloudinary

# Gestion du panier (état global)
yarn add zustand

# Notifications toast
yarn add react-hot-toast

# Formulaires
yarn add react-hook-form @hookform/resolvers
```

### Variables d'environnement — `.env.local`

```env
# Base de données Railway
# Récupérer depuis Railway Dashboard → ton service MySQL → Variables → DATABASE_URL
DATABASE_URL="mysql://root:password@monorail.proxy.rlwy.net:12345/railway"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="une-chaine-aleatoire-longue-ici"  # générer avec : openssl rand -base64 32

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="ton_cloud_name"
CLOUDINARY_API_KEY="ta_api_key"
CLOUDINARY_API_SECRET="ton_api_secret"
CLOUDINARY_UPLOAD_PRESET="ecommerce_products"  # à créer dans Cloudinary Dashboard (mode unsigned)
```

### Structure des dossiers

```
ecommerce-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (client)/
│   │   ├── products/page.tsx
│   │   ├── products/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── orders/page.tsx
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── products/new/page.tsx
│   │   ├── products/[id]/edit/page.tsx
│   │   └── orders/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── products/route.ts
│       ├── products/[id]/route.ts
│       ├── orders/route.ts
│       ├── orders/[id]/route.ts
│       ├── admin/orders/route.ts
│       ├── admin/orders/[id]/status/route.ts
│       ├── admin/stats/route.ts
│       └── upload/route.ts
├── components/
│   ├── ui/               # composants réutilisables (Button, Input, Badge…)
│   ├── products/         # ProductCard, ProductGrid, ProductForm
│   ├── cart/             # CartDrawer, CartItem
│   ├── orders/           # OrderTable, OrderStatusBadge
│   └── admin/            # AdminSidebar, StatsCard
├── lib/
│   ├── prisma.ts         # singleton Prisma client
│   ├── auth.ts           # config NextAuth
│   ├── cloudinary.ts     # helpers upload/delete
│   └── utils.ts          # fonctions utilitaires
├── store/
│   └── cartStore.ts      # Zustand store panier
├── types/
│   └── index.ts          # types TypeScript partagés
├── middleware.ts          # protection des routes
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

### Singleton Prisma — `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

> Sans ce singleton, Next.js en développement (hot reload) crée de nouvelles instances PrismaClient à chaque reload et épuise les connexions.

---

## 3. Authentification — NextAuth.js avec rôles

### Config NextAuth — `lib/auth.ts`

```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) return null

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,  // ← on passe le rôle dans l'objet retourné
        }
      },
    }),
  ],
  callbacks: {
    // jwt() s'exécute quand le token est créé ou mis à jour
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role  // on injecte le rôle dans le JWT
      }
      return token
    },
    // session() s'exécute à chaque accès à useSession() ou getServerSession()
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string  // rôle accessible dans toute l'app
      }
      return session
    },
  },
  pages: {
    signIn: '/login',  // page de connexion personnalisée
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
```

### Typage TypeScript — `types/index.ts`

```typescript
// Étendre les types NextAuth pour inclure le rôle
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'ADMIN' | 'CLIENT'
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'ADMIN' | 'CLIENT'
  }
}
```

### Route API NextAuth — `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### API Register — `app/api/auth/register/route.ts`

```typescript
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'CLIENT' },
      select: { id: true, email: true, name: true, role: true },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```

---

## 4. Middleware de protection des routes

### `middleware.ts` (racine du projet)

```typescript
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Si quelqu'un essaie d'accéder à /admin sans être ADMIN → redirection
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }

    // Si quelqu'un essaie d'accéder aux API admin sans être ADMIN → 403
    if (path.startsWith('/api/admin') && token?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // authorized() s'exécute en premier — si false, redirige vers /login automatiquement
      authorized: ({ token }) => !!token,
    },
  }
)

// Définir les routes protégées (le middleware s'exécute UNIQUEMENT sur ces paths)
export const config = {
  matcher: [
    '/admin/:path*',       // toutes les pages admin
    '/checkout',           // page checkout
    '/orders/:path*',      // commandes client
    '/api/admin/:path*',   // toutes les API admin
    '/api/orders/:path*',  // API commandes (nécessite d'être connecté)
  ],
}
```

> **Point critique** : sans ce middleware, un client peut appeler `GET /api/admin/orders` directement depuis Postman ou le navigateur et voir toutes les commandes. Le middleware bloque au niveau du serveur, avant même que le handler s'exécute.

---

## 5. Upload d'images — Cloudinary

### Configuration — `lib/cloudinary.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Supprimer une image par son public_id
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}
```

### API Upload — `app/api/upload/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cloudinary } from '@/lib/cloudinary'

export async function POST(request: Request) {
  // Seul un admin peut uploader
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
  }

  // Convertir le fichier en buffer base64
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

  const result = await cloudinary.uploader.upload(base64, {
    folder: 'ecommerce/products',
    transformation: [
      { width: 800, height: 800, crop: 'limit' },  // redimensionner max 800x800
      { quality: 'auto', fetch_format: 'auto' },    // optimisation auto
    ],
  })

  return NextResponse.json({
    url: result.secure_url,
    publicId: result.public_id,
  })
}
```

### Utilisation dans un formulaire React

```typescript
async function handleImageUpload(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  const { url, publicId } = await res.json()
  // Stocker url et publicId dans l'état du formulaire
}
```

---

## 6. API Routes — CRUD Produits

### GET + POST `/api/products/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validations'

// GET — liste des produits (public, avec filtres optionnels)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categorySlug = searchParams.get('category')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 12

  const where = {
    isActive: true,
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({
    products,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  })
}

// POST — créer un produit (admin uniquement)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const data = productSchema.parse(body)

    // Générer un slug unique à partir du nom
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const product = await prisma.product.create({
      data: { ...data, slug },
      include: { category: true },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }
}
```

### GET + PATCH + DELETE `/api/products/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteImage } from '@/lib/cloudinary'

// PATCH — modifier un produit
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const body = await request.json()

  // Si l'image change, supprimer l'ancienne sur Cloudinary
  if (body.imagePublicId) {
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      select: { imagePublicId: true },
    })
    if (existing?.imagePublicId && existing.imagePublicId !== body.imagePublicId) {
      await deleteImage(existing.imagePublicId)
    }
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(product)
}

// DELETE — supprimer un produit
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { imagePublicId: true },
  })

  if (product?.imagePublicId) {
    await deleteImage(product.imagePublicId)  // supprimer l'image Cloudinary
  }

  await prisma.product.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
```

---

## 7. Logique panier côté client

### Store Zustand — `store/cartStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  stock: number  // pour vérifier qu'on ne dépasse pas le stock disponible
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(  // persist = sauvegarde dans localStorage automatiquement
    (set, get) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id)

          if (existing) {
            // Ne pas dépasser le stock disponible
            if (existing.quantity >= product.stock) return state
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }

          return { items: [...state.items, { ...product, quantity: 1 }] }
        })
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'cart-storage',  // clé localStorage
    }
  )
)
```

---

## 8. API Routes — Commandes

### POST `/api/orders/route.ts` — Créer une commande

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { orderSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { items, addressLine, city, phone, note } = orderSchema.parse(body)

    // Récupérer les produits depuis la DB pour vérifier stocks et prix réels
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    })

    // Vérifier que tous les produits existent et ont assez de stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Produit introuvable : ${item.productId}` },
          { status: 400 }
        )
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour : ${product.name}` },
          { status: 400 }
        )
      }
    }

    // Calculer le total côté serveur (ne jamais faire confiance au prix envoyé par le client)
    const totalAmount = items.reduce((sum: number, item: any) => {
      const product = products.find((p) => p.id === item.productId)!
      return sum + Number(product.price) * item.quantity
    }, 0)

    // Transaction atomique : créer la commande + décrémenter les stocks en même temps
    const order = await prisma.$transaction(async (tx) => {
      // 1. Créer la commande
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          addressLine,
          city,
          phone,
          note,
          items: {
            create: items.map((item: any) => {
              const product = products.find((p) => p.id === item.productId)!
              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,  // snapshot du prix actuel
              }
            }),
          },
        },
        include: { items: { include: { product: true } } },
      })

      // 2. Décrémenter le stock de chaque produit
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la commande' }, { status: 500 })
  }
}

// GET — commandes du client connecté
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: { select: { name: true, imageUrl: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(orders)
}
```

### PATCH `/api/admin/orders/[id]/status/route.ts` — Modifier le statut

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { status } = await request.json()

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
  }

  // Si on annule une commande, on remet le stock
  if (status === 'CANCELLED') {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    })

    if (order && order.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        // Remettre le stock
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
        // Mettre à jour le statut
        await tx.order.update({
          where: { id: params.id },
          data: { status },
        })
      })

      return NextResponse.json({ success: true })
    }
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: { status },
  })

  return NextResponse.json(updated)
}
```

---

## 9. Dashboard Admin

### API Stats — `app/api/admin/stats/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalOrders,
    todayOrders,
    pendingOrders,
    totalRevenue,
    lowStockProducts,
  ] = await Promise.all([
    // Total commandes
    prisma.order.count(),

    // Commandes du jour
    prisma.order.count({
      where: { createdAt: { gte: today } },
    }),

    // Commandes en attente
    prisma.order.count({
      where: { status: 'PENDING' },
    }),

    // CA total (commandes livrées uniquement)
    prisma.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { totalAmount: true },
    }),

    // Produits en rupture ou stock faible (< 5)
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: 5 } },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: 'asc' },
    }),
  ])

  return NextResponse.json({
    totalOrders,
    todayOrders,
    pendingOrders,
    totalRevenue: totalRevenue._sum.totalAmount ?? 0,
    lowStockProducts,
  })
}
```

---

## 10. Seed de données de démo

### `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  // Nettoyer dans l'ordre correct (à cause des relations)
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // ── Utilisateurs ──────────────────────────────────────────────────────────

  const hashedPassword = await bcrypt.hash('password123', 12)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@demo.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const client = await prisma.user.create({
    data: {
      name: 'Jean Dupont',
      email: 'client@demo.com',
      password: hashedPassword,
      role: 'CLIENT',
    },
  })

  // ── Catégories ────────────────────────────────────────────────────────────

  const [electronics, clothing, food] = await Promise.all([
    prisma.category.create({ data: { name: 'Électronique', slug: 'electronique' } }),
    prisma.category.create({ data: { name: 'Vêtements', slug: 'vetements' } }),
    prisma.category.create({ data: { name: 'Alimentation', slug: 'alimentation' } }),
  ])

  // ── Produits ──────────────────────────────────────────────────────────────

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Smartphone Pro Max',
        slug: 'smartphone-pro-max',
        description: 'Dernier modèle avec écran AMOLED 6.7 pouces et triple caméra 108MP.',
        price: 299000,
        stock: 15,
        categoryId: electronics.id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imagePublicId: 'demo/sample',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Laptop Ultra Slim',
        slug: 'laptop-ultra-slim',
        description: 'Processeur i7, 16Go RAM, SSD 512Go. Parfait pour les professionnels.',
        price: 850000,
        stock: 8,
        categoryId: electronics.id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imagePublicId: 'demo/sample2',
      },
    }),
    prisma.product.create({
      data: {
        name: 'T-Shirt Premium Coton',
        slug: 'tshirt-premium-coton',
        description: '100% coton égyptien, disponible en plusieurs couleurs.',
        price: 8500,
        stock: 50,
        categoryId: clothing.id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imagePublicId: 'demo/sample3',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Café Arabica Premium 500g',
        slug: 'cafe-arabica-premium-500g',
        description: 'Café de spécialité torréfié artisanalement. Notes chocolatées.',
        price: 4500,
        stock: 3,  // stock faible volontaire pour tester l'alerte
        categoryId: food.id,
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        imagePublicId: 'demo/sample4',
      },
    }),
  ])

  // ── Commandes de démo ─────────────────────────────────────────────────────

  await prisma.order.create({
    data: {
      userId: client.id,
      totalAmount: 307500,
      addressLine: '12 Rue des Palmiers, Cocody',
      city: 'Abidjan',
      phone: '+225 07 00 00 00 00',
      status: 'DELIVERED',
      items: {
        create: [
          { productId: products[0].id, quantity: 1, unitPrice: 299000 },
          { productId: products[2].id, quantity: 1, unitPrice: 8500 },
        ],
      },
    },
  })

  await prisma.order.create({
    data: {
      userId: client.id,
      totalAmount: 850000,
      addressLine: '12 Rue des Palmiers, Cocody',
      city: 'Abidjan',
      phone: '+225 07 00 00 00 00',
      status: 'SHIPPED',
      items: {
        create: [{ productId: products[1].id, quantity: 1, unitPrice: 850000 }],
      },
    },
  })

  await prisma.order.create({
    data: {
      userId: client.id,
      totalAmount: 9000,
      addressLine: '12 Rue des Palmiers, Cocody',
      city: 'Abidjan',
      phone: '+225 07 00 00 00 00',
      status: 'PENDING',
      items: {
        create: [{ productId: products[3].id, quantity: 2, unitPrice: 4500 }],
      },
    },
  })

  console.log('✅ Seed terminé')
  console.log('  Admin  → admin@demo.com / password123')
  console.log('  Client → client@demo.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### Configurer le seed dans `package.json`

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

```bash
yarn add -D ts-node
yarn prisma db seed
```

---

## 11. Validation avec Zod

### `lib/validations.ts`

```typescript
import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive('Le prix doit être positif'),
  stock: z.number().int().min(0),
  categoryId: z.string().cuid(),
  imageUrl: z.string().url(),
  imagePublicId: z.string(),
})

export const orderSchema = z.object({
  addressLine: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  phone: z.string().min(8, 'Téléphone requis'),
  note: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, 'Le panier est vide'),
})

export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})
```

---

## 12. Déploiement Vercel

### Checklist avant le déploiement

```
□ Créer un projet Railway → ajouter un service MySQL
□ Récupérer la DATABASE_URL depuis Railway Dashboard (Variables du service MySQL)
□ yarn prisma db push  (pour pousser le schéma en prod)
□ yarn prisma db seed  (pour les données de démo)
□ Push du projet sur GitHub
□ Import du repo sur Vercel
□ Ajouter toutes les variables d'environnement dans Vercel (Settings → Environment Variables)
□ Redéployer après ajout des variables
```

### Variables à renseigner sur Vercel

```
DATABASE_URL                      ← connexion Railway MySQL prod
NEXTAUTH_URL                      ← https://ton-projet.vercel.app
NEXTAUTH_SECRET                   ← même secret qu'en local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ← ton cloud name
CLOUDINARY_API_KEY                ← ta clé API
CLOUDINARY_API_SECRET             ← ton secret
CLOUDINARY_UPLOAD_PRESET          ← ecommerce_products
```

> **Astuce Railway + Vercel** : Dans Railway, tu peux copier toutes les variables d'environnement d'un coup depuis l'onglet **Variables** de ton service MySQL. Colle-les directement dans Vercel.

### Configuration Cloudinary Dashboard

1. Se connecter sur [cloudinary.com](https://cloudinary.com)
2. Aller dans **Settings → Upload**
3. Cliquer **Add upload preset**
4. Mode : **Unsigned** (pour permettre l'upload depuis le frontend)
5. Folder : `ecommerce/products`
6. Nommer le preset : `ecommerce_products`

---

## 13. Structure des maquettes Figma

### Pages à créer dans Figma

```
📁 E-Commerce App
├── 🎨 Design System
│   ├── Colors (primaire, secondaire, success, warning, danger, neutres)
│   ├── Typography (titres, corps, labels, captions)
│   ├── Components (Button, Input, Badge, Card, Table, Toast)
│   └── Icons (Heroicons ou Lucide)
│
├── 👤 Auth
│   ├── Login
│   └── Register
│
├── 🛒 Client
│   ├── Catalogue (grid produits + filtres sidebar)
│   ├── Fiche produit
│   ├── Panier (drawer latéral)
│   ├── Checkout
│   ├── Confirmation de commande
│   └── Mes commandes
│
└── 🔧 Admin
    ├── Dashboard (KPIs + tableau recent orders)
    ├── Produits (liste avec actions)
    ├── Ajouter/Modifier produit (formulaire)
    └── Commandes (tableau avec filtre statut)
```

### Conseils pour impressionner en Figma

- **Créer des composants** pour les boutons, badges de statut, cards — montre que tu connais le concept de design system
- **Utiliser des variables de couleur** (Figma Variables) pour les couleurs primaires
- **Faire un prototype cliquable** sur le flow principal : `Catalogue → Fiche produit → Ajouter au panier → Checkout → Confirmation`
- **Les badges de statut commande** doivent être cohérents avec le code : `PENDING` = orange, `SHIPPED` = bleu, `DELIVERED` = vert, `CANCELLED` = rouge
- **Mobile-first pour le catalogue** — montrer la version mobile de la page catalogue montre une sensibilité UX

---

## 14. README de présentation

### Template `README.md`

````markdown
# 🛒 E-Commerce App

Application e-commerce full-stack avec gestion des rôles Admin/Client.

**Demo live** → https://ton-projet.vercel.app

## Comptes de démo

| Rôle  | Email              | Mot de passe  |
|-------|--------------------|---------------|
| Admin | admin@demo.com     | password123   |
| Client | client@demo.com   | password123   |

## Stack technique

| Couche      | Technologie          |
|-------------|----------------------|
| Frontend    | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend     | Next.js API Routes   |
| Base de données | Railway (MySQL) |
| ORM         | Prisma               |
| Auth        | NextAuth.js          |
| Images      | Cloudinary           |
| Déploiement | Vercel               |

## Fonctionnalités

**Admin**
- Dashboard avec KPIs (commandes du jour, CA, alertes stock)
- CRUD complet sur les produits avec upload d'images
- Gestion des commandes et modification du statut

**Client**
- Catalogue avec recherche et filtres par catégorie
- Panier persistant (localStorage)
- Passage de commande (paiement à la livraison)
- Historique des commandes et suivi du statut

## Lancer en local

```bash
git clone https://github.com/ton-user/ecommerce-app
cd ecommerce-app
yarn install

# Copier et remplir les variables d'environnement
cp .env.example .env.local

# Pousser le schéma et seed les données
yarn prisma db push
yarn prisma db seed

yarn dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)
````

---

*Document généré pour le projet e-commerce — recrutement*
