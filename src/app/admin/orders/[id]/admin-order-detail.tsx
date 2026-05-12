"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Package,
  User,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/mock-data";

type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
  };
}

interface AdminOrderDetailProps {
  order: {
    id: string;
    status: OrderStatus;
    totalAmount: number;
    addressLine: string | null;
    city: string | null;
    phone: string;
    note: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    items: OrderItem[];
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  } | null;
}

const statusOptions: {
  value: OrderStatus;
  label: string;
  icon: typeof Clock;
  className: string;
}[] = [
  { value: "PENDING", label: "En attente", icon: Clock, className: "bg-yellow-500 hover:bg-yellow-500" },
  { value: "CONFIRMED", label: "Confirmée", icon: CheckCircle, className: "bg-blue-500 hover:bg-blue-500" },
  { value: "SHIPPED", label: "Expédiée", icon: Truck, className: "bg-purple-500 hover:bg-purple-500" },
  { value: "DELIVERED", label: "Livrée", icon: CheckCircle, className: "bg-green-500 hover:bg-green-500" },
  { value: "CANCELLED", label: "Annulée", icon: XCircle, className: "bg-red-500 hover:bg-red-500" },
];

export function AdminOrderDetail({ order, user }: AdminOrderDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [updating, setUpdating] = useState(false);

  const currentStatus =
    statusOptions.find((s) => s.value === status) ?? statusOptions[0];
  const StatusIcon = currentStatus.icon;

  const updateStatus = async (newStatus: OrderStatus) => {
    if (newStatus === status) return;

    if (
      newStatus === "CANCELLED" &&
      !confirm(
        "Annuler cette commande ? Le stock des produits sera restauré automatiquement."
      )
    ) {
      return;
    }

    setUpdating(true);
    const previous = status;
    setStatus(newStatus); // optimiste

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Échec de la mise à jour");
      }
      toast({ title: "Statut mis à jour", variant: "success" });
      router.refresh();
    } catch (error) {
      setStatus(previous); // rollback
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const total = Number(order.totalAmount);
  const itemsTotal = order.items.reduce(
    (acc, it) => acc + Number(it.unitPrice) * it.quantity,
    0
  );
  const shipping = Math.max(0, total - itemsTotal);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-lg truncate">
              Commande #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <Badge className={`gap-1 ${currentStatus.className}`}>
            <StatusIcon className="size-3" />
            {currentStatus.label}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne principale : articles + récap */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="size-5 text-primary" />
                  Articles ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Link
                      href={`/products/${item.product.slug}`}
                      target="_blank"
                      className="relative size-20 shrink-0 rounded-lg overflow-hidden bg-muted"
                    >
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.slug}`}
                        target="_blank"
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.quantity} × {formatPrice(Number(item.unitPrice))}
                      </p>
                    </div>
                    <p className="font-semibold text-primary whitespace-nowrap">
                      {formatPrice(Number(item.unitPrice) * item.quantity)}
                    </p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total articles</span>
                    <span>{formatPrice(itemsTotal)}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Livraison</span>
                      <span>{formatPrice(shipping)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {order.note && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Note du client</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {order.note}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne droite : statut + client + livraison */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Changer le statut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {statusOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = opt.value === status;
                  return (
                    <Button
                      key={opt.value}
                      variant={isActive ? "default" : "outline"}
                      className="w-full justify-start gap-2"
                      onClick={() => updateStatus(opt.value)}
                      disabled={updating || isActive}
                    >
                      <Icon className="size-4" />
                      {opt.label}
                    </Button>
                  );
                })}
                {status === "CANCELLED" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Le stock des articles a été restauré.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {user ? (
                  <>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="size-4 shrink-0" />
                      <a href={`mailto:${user.email}`} className="hover:text-primary truncate">
                        {user.email}
                      </a>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="size-4 shrink-0" />
                        <a href={`tel:${user.phone}`} className="hover:text-primary">
                          {user.phone}
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Compte client supprimé</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  Livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {order.addressLine || order.city ? (
                  <p className="text-muted-foreground">
                    {[order.addressLine, order.city].filter(Boolean).join(", ")}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    Pas d&apos;adresse renseignée
                  </p>
                )}
                <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                  <Phone className="size-4 shrink-0" />
                  <a href={`tel:${order.phone}`} className="hover:text-primary font-medium">
                    {order.phone}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
