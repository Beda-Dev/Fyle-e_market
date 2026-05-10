"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/mock-data";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice } =
    useCartStore();

  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2 font-heading">
            <ShoppingBag className="text-primary" data-icon />
            Votre Panier
            {items.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({items.reduce((acc, item) => acc + item.quantity, 0)} articles)
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="size-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="text-muted-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">
              Votre panier est vide
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Découvrez nos produits et ajoutez vos favoris au panier
            </p>
            <Button onClick={closeCart}>
              <Link href="/products">
                Commencer vos achats
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <ScrollArea className="flex-1">
              <div className="p-6 flex flex-col gap-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4"
                    >
                      <div className="relative size-20 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {item.product.name}
                        </h4>
                        <p className="text-primary font-semibold text-sm mt-1">
                          {formatPrice(item.product.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
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
                            <span className="w-8 text-center text-sm font-medium">
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 data-icon />
                          </Button>
                        </div>
                      </div>
                      <p className="font-semibold text-sm">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Cart footer */}
            <div className="border-t p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-semibold">{formatPrice(totalPrice)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg">
                <span className="font-heading font-semibold">Total</span>
                <span className="font-heading font-bold text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="lg"  onClick={closeCart}>
                  <Link href="/checkout">
                    Passer la commande
                  </Link>
                </Button>
                <Button variant="outline" size="lg" onClick={closeCart}>
                  <Link href="/cart">
                    Voir le panier
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
