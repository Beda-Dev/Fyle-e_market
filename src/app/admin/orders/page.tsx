"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice, type Order } from "@/lib/mock-data";

type AdminOrder = Order & {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
};

const getStatusBadge = (status: string) => {
  const statusConfig: Record<
    string,
    { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: typeof CheckCircle }
  > = {
    PENDING: { label: "En attente", variant: "outline", icon: Clock },
    CONFIRMED: { label: "Confirmée", variant: "secondary", icon: CheckCircle },
    SHIPPED: { label: "Expédiée", variant: "default", icon: Truck },
    DELIVERED: { label: "Livrée", variant: "default", icon: CheckCircle },
    CANCELLED: { label: "Annulée", variant: "destructive", icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((j) => setOrders(j.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading font-bold text-lg">Gestion des commandes</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "Chargement..." : `${orders.length} commandes`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">
                          {order.user
                            ? `${order.user.firstName} ${order.user.lastName}`
                            : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.user?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.items.length} article(s)
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(order.totalAmount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
