"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/mock-data";

export function CartContent() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } =
    useCartStore();
  const [promoCode, setPromoCode] = useState("");

  const totalPrice = getTotalPrice();
  const shippingThreshold = 50000;
  const shippingCost = totalPrice >= shippingThreshold ? 0 : 2500;
  const finalTotal = totalPrice + shippingCost;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="size-32 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="size-16 text-muted-foreground" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-brand-brown mb-3">
            Votre panier est vide
          </h1>
          <p className="text-muted-foreground mb-8">
            Découvrez nos produits et ajoutez vos favoris au panier pour
            commencer vos achats.
          </p>
          <Link href="/products">
            <Button size="lg">
              Commencer vos achats
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Accueil
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">Panier</span>
      </nav>

      <h1 className="font-heading font-bold text-3xl text-brand-brown mb-8">
        Votre panier ({items.reduce((acc, item) => acc + item.quantity, 0)}{" "}
        articles)
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Articles</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={clearCart}
              >
                Vider le panier
              </Button>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-4 py-4 border-b last:border-b-0"
                  >
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="relative size-24 rounded-lg overflow-hidden bg-muted flex-shrink-0"
                    >
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-medium hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.product.category.name}
                      </p>
                      <p className="font-semibold text-primary mt-2">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 data-icon />
                      </Button>
                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                        >
                          <Minus data-icon />
                        </Button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        >
                          <Plus data-icon />
                        </Button>
                      </div>
                      <p className="font-semibold">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Link href="/products">
            <Button variant="outline" className="mt-4">
              <ArrowRight className="rotate-180" data-icon="inline-start" />
              Continuer mes achats
            </Button>
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-32">
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Promo code */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    placeholder="Code promo"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline">Appliquer</Button>
              </div>

              <Separator />

              {/* Totals */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Gratuite</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                    <Truck className="inline-block mr-2 size-4" />
                    Plus que{" "}
                    <span className="font-medium text-primary">
                      {formatPrice(shippingThreshold - totalPrice)}
                    </span>{" "}
                    pour la livraison gratuite
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(finalTotal)}</span>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full mt-2">
                  Passer la commande
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </Link>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 pt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Truck className="size-4" />
                  Livraison sécurisée
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="size-4" />
                  Meilleurs prix
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
