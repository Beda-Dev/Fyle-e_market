"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Edit, Trash2, EyeOff } from "lucide-react";
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
import { formatPrice, type Product } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { confirm } from "@/hooks/use-confirm";

const PAGE_SIZE = 20;

interface ListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = () => {
    setLoading(true);
    fetch(`/api/admin/products?page=${page}&pageSize=${PAGE_SIZE}`)
      .then((r) => r.json())
      .then((j) => {
        setProducts(j.data ?? []);
        setMeta(j.meta ?? null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (product: Product) => {
    const ok = await confirm({
      title: `Supprimer "${product.name}" ?`,
      description:
        "Si ce produit a déjà été commandé, il sera simplement masqué pour préserver l'historique des commandes.",
      confirmLabel: "Supprimer",
      variant: "destructive",
    });
    if (!ok) return;
    setDeletingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Suppression impossible");
      if (json.data?.deactivated) {
        toast({
          title: "Produit masqué",
          description:
            "Ce produit a déjà des commandes : il a été masqué au lieu d'être supprimé.",
          variant: "success",
        });
      } else {
        toast({ title: "Produit supprimé", variant: "success" });
      }
      loadProducts();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur inconnue",
        variant: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-heading font-bold text-lg">Gestion des produits</h1>
                <p className="text-sm text-muted-foreground">
                  {loading
                    ? "Chargement..."
                    : `${meta?.total ?? products.length} produit${(meta?.total ?? products.length) > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <Link href="/admin/products/new">
              <Button className="bg-brand-orange hover:bg-brand-orange/90 gap-2">
                <Plus className="size-4" />
                Nouveau produit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatPrice(product.price)}</p>
                        {product.originalPrice > product.price && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.stock < 5
                            ? "destructive"
                            : product.stock < 10
                            ? "secondary"
                            : "default"
                        }
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {!product.isActive && (
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            <EyeOff className="size-3" />
                            Masqué
                          </Badge>
                        )}
                        {product.isFeatured && (
                          <Badge className="bg-brand-orange">En vedette</Badge>
                        )}
                        {product.isNew && (
                          <Badge variant="secondary">Nouveau</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon" aria-label="Modifier">
                            <Edit className="size-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product.id}
                          aria-label="Supprimer"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {meta.page} / {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages || loading}
            >
              Suivant
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
