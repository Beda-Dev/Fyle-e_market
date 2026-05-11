import { Header, Footer } from "@/components/layout";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";
import type { Product } from "@/lib/mock-data";
import { CategoryContent } from "./category-content";
import { notFound } from "next/navigation";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  const productsRaw = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
    },
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  const products = productsRaw.map((p) => ({
    ...serializeProduct(p),
    images: (p.images as string[] | null) ?? [],
  })) as Product[];

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <CategoryContent category={category} products={products} />
      </main>
      <Footer />
    </>
  );
}
