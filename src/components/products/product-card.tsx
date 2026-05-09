"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, getDiscountPercentage, type Product } from "@/lib/mock-data";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore();
  const discountPercentage = getDiscountPercentage(
    product.price,
    product.originalPrice
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="group relative overflow-hidden bg-card border-0 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Link href={`/products/${product.slug}`}>
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-[#73442A] text-white hover:bg-[#73442A]">
                Nouveau
              </Badge>
            )}
            {discountPercentage && (
              <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="secondary"
              className="size-9 rounded-full bg-white shadow-md hover:bg-primary hover:text-white"
              aria-label="Ajouter aux favoris"
            >
              <Heart data-icon />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="size-9 rounded-full bg-white shadow-md hover:bg-primary hover:text-white"
              asChild
            >
              <Link href={`/products/${product.slug}`} aria-label="Voir le produit">
                <Eye data-icon />
              </Link>
            </Button>
          </div>

          {/* Add to cart overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              className="w-full gap-2"
              onClick={() => addItem(product)}
            >
              <ShoppingCart data-icon="inline-start" />
              Ajouter au panier
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Category */}
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {product.category.name}
          </Link>

          {/* Name */}
          <h3 className="font-medium mt-1 line-clamp-2 min-h-[2.5rem]">
            <Link
              href={`/products/${product.slug}`}
              className="hover:text-primary transition-colors"
            >
              {product.name}
            </Link>
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-heading font-bold text-lg text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          {product.stock < 5 && product.stock > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              Plus que {product.stock} en stock
            </p>
          )}
          {product.stock === 0 && (
            <p className="text-xs text-destructive mt-2">Rupture de stock</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
