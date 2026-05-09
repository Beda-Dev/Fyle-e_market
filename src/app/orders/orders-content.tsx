"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Calendar, MapPin, Phone } from "lucide-react";
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

interface OrdersContentProps {
  orders: OrderWithItems[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-yellow-500" },
  CONFIRMED: { label: "Confirmée", color: "bg-blue-500" },
  SHIPPED: { label: "Expédiée", color: "bg-purple-500" },
  DELIVERED: { label: "Livrée", color: "bg-green-500" },
  CANCELLED: { label: "Annulée", color: "bg-red-500" },
};

export function OrdersContent({ orders }: OrdersContentProps) {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="size-32 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Package className="size-16 text-muted-foreground" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-brand-brown mb-3">
            Aucune commande
          </h1>
          <p className="text-muted-foreground mb-8">
            Vous n'avez pas encore passé de commande. Découvrez nos produits et commencez vos achats.
          </p>
          <Link href="/products">
            <Button size="lg">
              Voir les produits
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
        <ArrowRight className="size-4" />
        <span className="text-foreground">Mes commandes</span>
      </nav>

      <h1 className="font-heading font-bold text-3xl text-brand-brown mb-8">
        Mes commandes ({orders.length})
      </h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const status = statusLabels[order.status] || statusLabels.PENDING;
          const total = Number(order.totalAmount);
          
          return (
            <Card
              key={order.id}
              className="cursor-pointer hover:border-brand-orange transition-colors"
              onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        Commande #{order.id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="size-4" />
                        {order.items.length} article{order.items.length > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold text-2xl text-primary">
                      {total.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                </div>
              </CardHeader>

              {selectedOrder === order.id && (
                <CardContent className="border-t pt-6 space-y-6">
                  {/* Items */}
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative size-20 flex-shrink-0">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Quantité: {item.quantity} × {Number(item.unitPrice).toLocaleString("fr-FR")} FCFA
                          </p>
                          <p className="font-medium text-primary mt-1">
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
                  <div className="flex items-center gap-2 text-sm">
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
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-medium">Total</span>
                    <span className="font-heading font-bold text-2xl text-primary">
                      {total.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
