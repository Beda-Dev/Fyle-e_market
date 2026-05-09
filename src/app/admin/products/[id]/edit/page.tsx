import { Metadata } from "next";
import { ProductForm } from "./product-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Modifier le produit | Eburnie Admin",
  description: "Modifier un produit",
};

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Produit introuvable</h1>
          <p className="text-muted-foreground">Le produit demandé n'existe pas.</p>
        </div>
      </div>
    );
  }

  return <ProductForm product={product} />;
}
