import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { ProductDetailContent } from "./product-detail-content";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";
import { notFound } from "next/navigation";
import type { Product } from "@/lib/mock-data";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, imageUrl: true, isActive: true },
  });

  if (!product || !product.isActive) {
    return { title: "Produit introuvable" };
  }

  const description = product.description.slice(0, 160);

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: { category: { select: { id: true, name: true, slug: true } } },
    take: 4,
  });

  const serialize = (p: typeof product): Product => ({
    ...serializeProduct(p),
    images: (p.images as string[] | null) ?? [],
  } as Product);

  return (
    <>
      <Header />
      <main className="flex-1">
        <ProductDetailContent
          product={serialize(product)}
          relatedProducts={related.map(serialize)}
        />
      </main>
      <Footer />
    </>
  );
}
