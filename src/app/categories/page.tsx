import { Header, Footer } from "@/components/layout";
import { prisma } from "@/lib/prisma";
import { CategoriesContent } from "./categories-content";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <CategoriesContent categories={categories} />
      </main>
      <Footer />
    </>
  );
}
