"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, CheckCircle, Clock, Truck, XCircle, X } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { confirm } from "@/hooks/use-confirm";
import { formatPrice, type Order } from "@/lib/mock-data";

type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
];

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

const PAGE_SIZE = 20;

interface ListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<OrderStatus | "">("");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    fetch(`/api/admin/orders?page=${page}&pageSize=${PAGE_SIZE}`)
      .then((r) => r.json())
      .then((j) => {
        setOrders(j.data ?? []);
        setMeta(j.meta ?? null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
    // Reset la sélection à chaque changement de page
    setSelectedIds(new Set());
    setBulkStatus("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const allVisibleSelected = useMemo(
    () => orders.length > 0 && orders.every((o) => selectedIds.has(o.id)),
    [orders, selectedIds]
  );

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        orders.forEach((o) => next.delete(o.id));
      } else {
        orders.forEach((o) => next.add(o.id));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setBulkStatus("");
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    if (bulkStatus === "CANCELLED") {
      const ok = await confirm({
        title: `Annuler ${selectedIds.size} commande${selectedIds.size > 1 ? "s" : ""} ?`,
        description: "Le stock des produits sera restauré automatiquement.",
        confirmLabel: "Annuler les commandes",
        cancelLabel: "Retour",
        variant: "destructive",
      });
      if (!ok) return;
    }

    setBulkUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          status: bulkStatus,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Échec de la mise à jour");
      }
      const { updated, skipped } = json.data ?? {};
      toast({
        title: "Statuts mis à jour",
        description: `${updated} commande${updated > 1 ? "s" : ""} mise${updated > 1 ? "s" : ""} à jour${skipped ? ` — ${skipped} ignorée${skipped > 1 ? "s" : ""} (déjà au bon statut)` : ""}.`,
        variant: "success",
      });
      clearSelection();
      loadOrders();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "error",
      });
    } finally {
      setBulkUpdating(false);
    }
  };

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
                {loading
                  ? "Chargement..."
                  : `${meta?.total ?? orders.length} commande${(meta?.total ?? orders.length) > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {selectedIds.size > 0 && (
          <div className="sticky top-[72px] z-30 mb-4 bg-card border rounded-lg shadow-sm px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-sm font-medium">
              {selectedIds.size} commande{selectedIds.size > 1 ? "s" : ""} sélectionnée{selectedIds.size > 1 ? "s" : ""}
            </span>
            <div className="flex-1" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as OrderStatus | "")}
                className="h-9 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                disabled={bulkUpdating}
              >
                <option value="">— Choisir un statut —</option>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={handleBulkUpdate}
                disabled={!bulkStatus || bulkUpdating}
              >
                {bulkUpdating ? "Application..." : "Appliquer"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
                disabled={bulkUpdating}
                aria-label="Annuler la sélection"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      aria-label="Tout sélectionner sur cette page"
                      checked={allVisibleSelected}
                      onChange={toggleAllVisible}
                      disabled={orders.length === 0}
                      className="size-4 accent-primary cursor-pointer"
                    />
                  </TableHead>
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
                  <TableRow
                    key={order.id}
                    data-state={selectedIds.has(order.id) ? "selected" : undefined}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`Sélectionner la commande ${order.id.slice(-6).toUpperCase()}`}
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleOne(order.id)}
                        className="size-4 accent-primary cursor-pointer"
                      />
                    </TableCell>
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
                      <Link href={`/admin/orders/${order.id}`} aria-label="Voir le détail de la commande">
                        <Button variant="ghost" size="icon">
                          <Eye className="size-4" />
                        </Button>
                      </Link>
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
