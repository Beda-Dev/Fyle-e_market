import { Header, Footer } from '@/components/layout'
import {
  HeroSection,
  CategoriesSection,
  FeaturedProductsSection,
  PromoBannerSection,
  NewArrivalsSection,
  TestimonialsSection,
} from '@/components/home'
import { prisma } from '@/lib/prisma'
import { serializeProduct } from '@/lib/serializers'
import type { Product } from '@/lib/mock-data'

export default async function HomePage() {
  const [categoriesRaw, featuredRaw, newArrivalsRaw] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true, isNew: true },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    productCount: c._count.products,
  }))

  const toProduct = (p: typeof featuredRaw[number]): Product => ({
    ...serializeProduct(p),
    images: (p.images as string[] | null) ?? [],
  } as Product)

  const featured = featuredRaw.map(toProduct)
  const newArrivals = newArrivalsRaw.map(toProduct)

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection categories={categories} />
        <FeaturedProductsSection products={featured} />
        <PromoBannerSection />
        <NewArrivalsSection products={newArrivals} />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  )
}
