import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";
import type { Product } from "@/lib/mock-data";
import { CategoryContent } from "./category-content";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true, image: true },
  });

  if (!category) return { title: "Catégorie introuvable" };

  const description =
    category.description?.slice(0, 160) ??
    `Découvrez tous les produits de la catégorie ${category.name} sur Eburnie.`;

  return {
    title: category.name,
    description,
    openGraph: {
      title: category.name,
      description,
      images: category.image ? [{ url: category.image }] : undefined,
    },
  };
}

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
