"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { categories } from "@/lib/mock-data";

export function CategoriesSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-[#73442A]">
              Explorer par catégorie
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Parcourez notre sélection de catégories et trouvez exactement ce que vous cherchez
            </p>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all group"
          >
            Toutes les catégories
            <ArrowRight className="transition-transform group-hover:translate-x-1" data-icon />
          </Link>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={`/products?category=${category.slug}`}>
                <Card className="group relative overflow-hidden border-0 bg-muted/30 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-heading font-semibold text-white text-sm lg:text-base">
                          {category.name}
                        </h3>
                        <p className="text-white/70 text-xs mt-1">
                          {category.productCount} produits
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
