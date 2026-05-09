"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/products/product-card";
import { useCartStore } from "@/store/cart-store";
import {
  formatPrice,
  getDiscountPercentage,
  type Product,
} from "@/lib/mock-data";

interface ProductDetailContentProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailContent({
  product,
  relatedProducts,
}: ProductDetailContentProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  // image principale + galerie
  const gallery = [product.imageUrl, ...(product.images ?? [])].filter(Boolean);

  const discountPercentage = getDiscountPercentage(
    product.price,
    product.originalPrice
  );

  const handleAddToCart = () => {
    addItem(product, quantity);
    setQuantity(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Accueil
        </Link>
        <ChevronRight className="size-4" />
        <Link
          href="/products"
          className="hover:text-foreground transition-colors"
        >
          Boutique
        </Link>
        <ChevronRight className="size-4" />
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-foreground transition-colors"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Product Detail */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Images */}
        <div className="flex flex-col gap-4">
          {/* Main Image */}
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative aspect-square rounded-2xl overflow-hidden bg-muted"
          >
            <Image
              src={gallery[selectedImage] ?? product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
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
          </motion.div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {gallery.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative size-20 rounded-lg overflow-hidden flex-shrink-0 ring-2 transition-all ${
                    selectedImage === index
                      ? "ring-primary"
                      : "ring-transparent hover:ring-primary/50"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Category */}
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-sm text-primary hover:underline"
          >
            {product.category.name}
          </Link>

          {/* Title */}
          <h1 className="font-heading font-bold text-2xl lg:text-3xl text-[#73442A] mt-2">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-6">
            <span className="font-heading font-bold text-3xl text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground mt-6 leading-relaxed">
            {product.description}
          </p>

          <Separator className="my-6" />

          {/* Quantity & Add to cart */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus data-icon />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= product.stock}
              >
                <Plus data-icon />
              </Button>
            </div>

            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? (
                "Rupture de stock"
              ) : (
                <>
                  Ajouter au panier
                  <span className="text-primary-foreground/70">
                    {formatPrice(product.price * quantity)}
                  </span>
                </>
              )}
            </Button>

            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Heart data-icon />
            </Button>

            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Share2 data-icon />
            </Button>
          </div>

          {/* Stock indicator */}
          {product.stock > 0 && product.stock < 10 && (
            <p className="text-sm text-amber-600 mt-4 flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500" />
              Plus que {product.stock} en stock
            </p>
          )}
          {product.stock >= 10 && (
            <p className="text-sm text-green-600 mt-4 flex items-center gap-2">
              <Check className="size-4" />
              En stock
            </p>
          )}

          <Separator className="my-6" />

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Truck className="text-primary flex-shrink-0" data-icon />
              <div>
                <p className="text-sm font-medium">Livraison gratuite</p>
                <p className="text-xs text-muted-foreground">Dès 50 000 FCFA</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="text-primary flex-shrink-0" data-icon />
              <div>
                <p className="text-sm font-medium">Garantie 1 an</p>
                <p className="text-xs text-muted-foreground">Service après-vente</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <RotateCcw className="text-primary flex-shrink-0" data-icon />
              <div>
                <p className="text-sm font-medium">Retour facile</p>
                <p className="text-xs text-muted-foreground">Sous 14 jours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mb-16">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger
            value="description"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
          >
            Livraison
          </TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="pt-6">
          <div className="prose max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
            <h3 className="font-heading font-semibold text-lg text-[#73442A] mt-6 mb-3">
              Caractéristiques
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Matériaux de haute qualité</li>
              <li>Design moderne et élégant</li>
              <li>Confort optimal</li>
              <li>Durabilité garantie</li>
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="shipping" className="pt-6">
          <div className="space-y-4 text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Délais de livraison
              </h4>
              <p>
                Livraison standard : 3-5 jours ouvrés
                <br />
                Livraison express : 24-48h (disponible dans certaines zones)
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Frais de livraison
              </h4>
              <p>
                Livraison gratuite pour les commandes de plus de 50 000 FCFA.
                <br />
                Frais standard : 2 500 FCFA
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Paiement à la livraison
              </h4>
              <p>
                Payez en espèces à la réception de votre commande. Aucun
                paiement en ligne requis.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="font-heading font-bold text-2xl lg:text-3xl text-[#73442A] mb-8">
            Produits similaires
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct, index) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
