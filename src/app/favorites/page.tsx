"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowRight, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header, Footer } from "@/components/layout";
import { useFavoritesStore } from "@/store/favorites-store";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/mock-data";

export default function FavoritesPage() {
  const { items, removeFavorite, clearFavorites } = useFavoritesStore();
  const { addItem } = useCartStore();

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Accueil
            </Link>
            <ArrowRight className="size-4" />
            <span className="text-foreground">Mes favoris</span>
          </nav>

          {items.length === 0 ? (
            /* État vide */
            <div className="max-w-md mx-auto text-center py-16">
              <div className="size-32 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Heart className="size-16 text-muted-foreground" />
              </div>
              <h1 className="font-heading font-bold text-2xl text-brand-brown mb-3">
                Aucun favori
              </h1>
              <p className="text-muted-foreground mb-8">
                Parcourez nos produits et ajoutez vos coups de cœur en cliquant
                sur le bouton cœur.
              </p>
              <Link href="/products">
                <Button size="lg">
                  Découvrir les produits
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </Link>
            </div>
          ) : (
            /* Liste des favoris */
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="font-heading font-bold text-3xl text-brand-brown">
                  Mes favoris ({items.length})
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFavorites}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4 mr-2" />
                  Tout supprimer
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="relative aspect-square bg-muted">
                      <Link href={`/products/${product.slug}`}>
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </Link>
                      {/* Bouton retirer */}
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-3 right-3 size-9 rounded-full bg-white shadow-md hover:bg-destructive hover:text-white"
                        onClick={() => removeFavorite(product.id)}
                        aria-label="Retirer des favoris"
                      >
                        <Heart className="fill-current text-primary" data-icon />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <Link
                        href={`/products/${product.slug}`}
                        className="font-medium line-clamp-2 hover:text-primary transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="font-heading font-bold text-lg text-primary mt-2">
                        {formatPrice(product.price)}
                      </p>
                      <Button
                        className="w-full mt-3 gap-2"
                        onClick={() => addItem(product)}
                      >
                        <ShoppingCart className="size-4" />
                        Ajouter au panier
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
