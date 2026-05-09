import { Header, Footer } from "@/components/layout";
import { ProductsContent } from "./products-content";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";
import type { Product } from "@/lib/mock-data";

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
        <ProductsContent products={products} categories={categories} />
      </main>
      <Footer />
    </>
  );
}
