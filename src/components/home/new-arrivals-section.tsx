"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { getNewProducts } from "@/lib/mock-data";

export function NewArrivalsSection() {
  const newProducts = getNewProducts();

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#73442A] text-white text-xs font-medium mb-4">
              Nouvelles Arrivées
            </span>
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-[#73442A]">
              Nos dernières nouveautés
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Soyez les premiers à découvrir nos nouveaux produits fraîchement arrivés
            </p>
          </div>
          <Link
            href="/products?sort=newest"
            className="flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all group"
          >
            Voir toutes les nouveautés
            <ArrowRight className="transition-transform group-hover:translate-x-1" data-icon />
          </Link>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
