import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const url = new URL(process.env.DATABASE_URL!)
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: url.port ? Number(url.port) : 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
  connectionLimit: 5,
  connectTimeout: 30_000,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seed start')

  // ─── Admin user ─────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin1234@', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'dinguibedajunior@gmail.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'dinguibedajunior@gmail.com',
      password: adminPassword,
      firstName: 'Junior',
      lastName: 'Dingui Beda',
      phone: '+225 05 66 95 59 43',
      role: 'ADMIN',
    },
  })
  console.log(`  admin    → ${admin.email}`)

  // ─── Settings ───────────────────────────────────────────────────────────
  const existingSetting = await prisma.setting.findFirst()
  if (!existingSetting) {
    await prisma.setting.create({
      data: {
        customerService: '+225 00 00 00 00 00',
        email: 'contact@eburnie.com',
        whatsapp: '+225 00 00 00 00 00',
        slogan:
          "L'élégance ivoirienne livrée chez vous. Produits soigneusement sélectionnés, paiement à la livraison.",
        location: 'Abidjan, Côte d\'Ivoire',
        shippingCost: 2500,
      },
    })
    console.log('  setting  → created')
  }

  // ─── Categories ─────────────────────────────────────────────────────────
  const categoriesData = [
    {
      slug: 'electronique',
      name: 'Électronique',
      description: 'Smartphones, ordinateurs, accessoires et gadgets tech',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
    },
    {
      slug: 'mode-vetements',
      name: 'Mode & Vêtements',
      description: 'Vêtements tendance pour homme et femme',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
    },
    {
      slug: 'maison-deco',
      name: 'Maison & Déco',
      description: 'Meubles, décoration et articles pour la maison',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    },
    {
      slug: 'sport-loisirs',
      name: 'Sport & Loisirs',
      description: 'Équipements sportifs et articles de loisirs',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    },
    {
      slug: 'beaute-sante',
      name: 'Beauté & Santé',
      description: 'Cosmétiques, soins et produits de bien-être',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    },
    {
      slug: 'alimentation',
      name: 'Alimentation',
      description: 'Produits alimentaires de qualité',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    },
  ]

  for (const c of categoriesData) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, image: c.image },
      create: c,
    })
  }
  console.log(`  categories → ${categoriesData.length}`)

  const categoryBySlug = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  )

  // ─── Products ───────────────────────────────────────────────────────────
  const productsData = [
    {
      slug: 'casque-audio-sans-fil-premium',
      name: 'Casque Audio Sans Fil Premium',
      description:
        "Profitez d'une qualité sonore exceptionnelle avec notre casque sans fil premium. Doté de la technologie de réduction de bruit active, il offre jusqu'à 30 heures d'autonomie et un confort optimal pour une utilisation prolongée.",
      price: 89990,
      originalPrice: 119990,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      images: [
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
      ],
      categorySlug: 'electronique',
      isFeatured: true,
      isNew: true,
    },
    {
      slug: 'montre-connectee-elite',
      name: 'Montre Connectée Elite',
      description:
        "La montre connectée qui allie élégance et technologie. Suivez votre activité physique, recevez vos notifications et profitez d'une autonomie de 7 jours.",
      price: 149990,
      originalPrice: 149990,
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'],
      categorySlug: 'electronique',
      isFeatured: true,
      isNew: false,
    },
    {
      slug: 'sac-main-cuir-artisanal',
      name: 'Sac à Main en Cuir Artisanal',
      description:
        'Un sac à main confectionné à la main avec du cuir de première qualité. Design intemporel et finitions soignées pour un accessoire qui vous accompagnera pendant des années.',
      price: 79990,
      originalPrice: 99990,
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
      images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
      categorySlug: 'mode-vetements',
      isFeatured: true,
      isNew: false,
    },
    {
      slug: 'lampe-bureau-design',
      name: 'Lampe de Bureau Design',
      description:
        'Illuminez votre espace de travail avec cette lampe au design épuré. Luminosité ajustable et bras articulé pour un éclairage optimal.',
      price: 45990,
      originalPrice: 45990,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
      images: [],
      categorySlug: 'maison-deco',
      isFeatured: false,
      isNew: true,
    },
    {
      slug: 'sneakers-running-performance',
      name: 'Sneakers Running Performance',
      description:
        'Chaussures de running conçues pour la performance. Semelle ultra-légère et amorti optimal pour vos entraînements.',
      price: 69990,
      originalPrice: 69990,
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800'],
      categorySlug: 'sport-loisirs',
      isFeatured: true,
      isNew: false,
    },
    {
      slug: 'coffret-soins-visage-bio',
      name: 'Coffret Soins Visage Bio',
      description:
        'Un coffret complet de soins naturels pour le visage. Crème hydratante, sérum et masque aux ingrédients biologiques.',
      price: 54990,
      originalPrice: 69990,
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
      images: ['https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=800'],
      categorySlug: 'beaute-sante',
      isFeatured: false,
      isNew: true,
    },
    {
      slug: 'ecouteurs-bluetooth-sport',
      name: 'Écouteurs Bluetooth Sport',
      description:
        "Écouteurs intra-auriculaires résistants à l'eau, parfaits pour le sport. Son puissant et maintien sécurisé.",
      price: 39990,
      originalPrice: 39990,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
      images: [],
      categorySlug: 'electronique',
      isFeatured: false,
      isNew: false,
    },
    {
      slug: 'veste-jean-vintage',
      name: 'Veste en Jean Vintage',
      description:
        'Une veste en jean au style rétro avec une coupe moderne. Confortable et polyvalente pour toutes les saisons.',
      price: 59990,
      originalPrice: 59990,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      images: [],
      categorySlug: 'mode-vetements',
      isFeatured: false,
      isNew: false,
    },
  ]

  for (const p of productsData) {
    const categoryId = categoryBySlug[p.categorySlug]
    if (!categoryId) throw new Error(`Categorie absente: ${p.categorySlug}`)

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        imageUrl: p.imageUrl,
        images: p.images,
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        categoryId,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        imageUrl: p.imageUrl,
        imagePublicId: `seed/${p.slug}`,
        images: p.images,
        isActive: true,
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        categoryId,
      },
    })
  }
  console.log(`  products → ${productsData.length}`)

  console.log('Seed done')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
