"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ArrowRight, Home, Package, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Order, OrderItem } from "@prisma/client";

type OrderWithItems = Order & {
  items: (OrderItem & {
    product: {
      id: string;
      name: string;
      imageUrl: string;
    };
  })[];
};

interface OrderConfirmationContentProps {
  order: OrderWithItems;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-yellow-500" },
  CONFIRMED: { label: "Confirmée", color: "bg-blue-500" },
  SHIPPED: { label: "Expédiée", color: "bg-purple-500" },
  DELIVERED: { label: "Livrée", color: "bg-green-500" },
  CANCELLED: { label: "Annulée", color: "bg-red-500" },
};

export function OrderConfirmationContent({ order }: OrderConfirmationContentProps) {
  const status = statusLabels[order.status] || statusLabels.PENDING;
  const total = Number(order.totalAmount);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Success message */}
        <div className="text-center mb-8">
          <div className="size-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="size-10 text-green-600" />
          </div>
          <h1 className="font-heading font-bold text-3xl text-brand-brown mb-2">
            Commande confirmée !
          </h1>
          <p className="text-muted-foreground">
            Merci pour votre achat. Votre commande a été enregistrée avec succès.
          </p>
        </div>

        {/* Order details card */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            {/* Order number */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <p className="text-sm text-muted-foreground">Numéro de commande</p>
                <p className="font-heading font-bold text-lg">
                  #{order.id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Statut</p>
                <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>

            {/* Order date */}
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <p className="text-sm text-muted-foreground">Date de commande</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4 pb-4 border-b">
              <h3 className="font-medium">Articles commandés</h3>
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative size-16 shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantité: {item.quantity} × {Number(item.unitPrice).toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">
                      {(Number(item.unitPrice) * item.quantity).toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping info */}
            {order.addressLine && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="size-4" />
                  Adresse de livraison
                </h4>
                <p className="text-sm text-muted-foreground">{order.addressLine}</p>
                {order.city && <p className="text-sm text-muted-foreground">{order.city}</p>}
              </div>
            )}

            {/* Phone */}
            <div className="flex items-center gap-2 text-sm pb-4 border-b">
              <Phone className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Téléphone:</span>
              <span className="font-medium">{order.phone}</span>
            </div>

            {/* Note */}
            {order.note && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Note</h4>
                <p className="text-sm text-muted-foreground">{order.note}</p>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center pt-4">
              <span className="font-heading font-bold text-lg">Total</span>
              <span className="font-heading font-bold text-2xl text-primary">
                {total.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Next steps */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-heading font-bold text-lg text-brand-brown mb-4">
              Prochaines étapes
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-xs">1</span>
                </div>
                <p className="text-muted-foreground">
                  Nous traitons votre commande et vous contacterons pour confirmer la disponibilité.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-xs">2</span>
                </div>
                <p className="text-muted-foreground">
                  Une fois confirmée, nous préparerons votre commande pour l'expédition.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-xs">3</span>
                </div>
                <p className="text-muted-foreground">
                  Vous serez livré à l'adresse indiquée. Le paiement se fera à la livraison.
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/orders" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Package className="size-4" />
              Voir mes commandes
            </Button>
          </Link>
          <Link href="/products" className="flex-1">
            <Button className="w-full bg-brand-orange hover:bg-brand-orange/90 gap-2">
              Continuer mes achats
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            <Home className="size-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
