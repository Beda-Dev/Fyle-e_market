"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  Home
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockProducts, mockOrders, formatPrice } from "@/lib/mock-data";

const stats = [
  {
    title: "Ventes totales",
    value: "2,450,000 FCFA",
    change: "+12.5%",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Commandes",
    value: "156",
    change: "+8.2%",
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Produits",
    value: mockProducts.length.toString(),
    change: "+3",
    icon: Package,
    color: "text-[#F07C1E]",
    bgColor: "bg-orange-50",
  },
  {
    title: "Clients",
    value: "89",
    change: "+5.1%",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: typeof CheckCircle }> = {
    PENDING: { label: "En attente", variant: "outline", icon: Clock },
    CONFIRMED: { label: "Confirmée", variant: "secondary", icon: CheckCircle },
    SHIPPED: { label: "Expédiée", variant: "default", icon: Truck },
    DELIVERED: { label: "Livrée", variant: "default", icon: CheckCircle },
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

export function AdminDashboard() {
  const recentOrders = mockOrders.slice(0, 5);
  const lowStockProducts = mockProducts.filter(p => p.stock < 10).slice(0, 5);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative size-10 bg-[#73442A] rounded-lg p-1">
                  <Image
                    src="/logo fyle market.png"
                    alt="FYLE MARKET"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="font-heading font-bold text-lg text-[#73442A]">FYLE MARKET</span>
                  <Badge variant="secondary" className="ml-2 text-xs">Admin</Badge>
                </div>
              </Link>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Home className="size-4" />
                Voir la boutique
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre espace administration
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className={`text-xs ${stat.color} mt-1`}>{stat.change}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`size-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Commandes récentes</CardTitle>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm" className="gap-1 text-[#F07C1E]">
                    Voir tout
                    <ArrowUpRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Low Stock Products */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Stock faible</CardTitle>
                <Link href="/admin/products">
                  <Button variant="ghost" size="sm" className="gap-1 text-[#F07C1E]">
                    Gérer les produits
                    <ArrowUpRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="relative size-12 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                      </div>
                      <Badge variant={product.stock < 5 ? "destructive" : "secondary"}>
                        {product.stock} en stock
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Tous les produits sont bien approvisionnés
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Quick Actions */}
        <div>
          <h2 className="font-heading text-lg font-semibold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/products/new">
              <Card className="hover:border-[#F07C1E] transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="size-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                    <Package className="size-6 text-[#F07C1E]" />
                  </div>
                  <p className="font-medium text-sm">Ajouter un produit</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/orders">
              <Card className="hover:border-[#F07C1E] transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                    <ShoppingCart className="size-6 text-blue-600" />
                  </div>
                  <p className="font-medium text-sm">Voir les commandes</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/products">
              <Card className="hover:border-[#F07C1E] transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="size-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                    <Eye className="size-6 text-green-600" />
                  </div>
                  <p className="font-medium text-sm">Gérer les produits</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/">
              <Card className="hover:border-[#F07C1E] transition-colors cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="size-12 rounded-full bg-purple-50 flex items-center justify-center mb-3">
                    <Home className="size-6 text-purple-600" />
                  </div>
                  <p className="font-medium text-sm">Voir la boutique</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
