"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { getFeaturedProducts } from "@/lib/mock-data";

export function FeaturedProductsSection() {
  const featuredProducts = getFeaturedProducts();

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-[#73442A]">
              Produits populaires
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Découvrez nos best-sellers et les coups de coeur de nos clients
            </p>
          </div>
          <Link
            href="/products?sort=popular"
            className="flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all group"
          >
            Voir tous les produits
            <ArrowRight className="transition-transform group-hover:translate-x-1" data-icon />
          </Link>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
