import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/mock-data";
import type { Category } from "@prisma/client";

interface CategoryContentProps {
  category: Category;
  products: Product[];
}

export function CategoryContent({ category, products }: CategoryContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Accueil
        </Link>
        <ArrowRight className="size-4" />
        <Link href="/categories" className="hover:text-foreground transition-colors">
          Catégories
        </Link>
        <ArrowRight className="size-4" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* Category header */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-brand-brown mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {products.length} produit{products.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            Aucun produit disponible dans cette catégorie pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
