import { Header, Footer } from "@/components/layout";
import { ProductDetailContent } from "./product-detail-content";
import { products, getProductBySlug } from "@/lib/mock-data";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <ProductDetailContent product={product} />
      </main>
      <Footer />
    </>
  );
}
