import { Header, Footer } from "@/components/layout";
import { ProductsContent } from "./products-content";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";
import type { Product } from "@/lib/mock-data";
import { Suspense } from "react";

function ProductsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-64 bg-muted rounded mb-8"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-muted rounded-lg"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ProductsPage() {
  const [productsRaw, categoriesRaw] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  const products: Product[] = productsRaw.map((p) => ({
    ...serializeProduct(p),
    images: (p.images as string[] | null) ?? [],
  } as Product));

  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    productCount: c._count.products,
  }));

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <Suspense fallback={<ProductsLoadingSkeleton />}>
          <ProductsContent products={products} categories={categories} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
