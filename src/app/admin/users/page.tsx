"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Search,
  Shield,
  ShieldOff,
  Mail,
  KeyRound,
  Trash2,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type Role = "ADMIN" | "CLIENT";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  _count: { orders: number };
}

interface ListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [loading, setLoading] = useState(true);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const loadUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (search.trim()) params.set("search", search.trim());
    if (roleFilter) params.set("role", roleFilter);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((j) => {
        setUsers(j.data ?? []);
        setMeta(j.meta ?? null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleRoleToggle = async (user: AdminUser) => {
    const newRole: Role = user.role === "ADMIN" ? "CLIENT" : "ADMIN";
    const action = newRole === "ADMIN" ? "promouvoir en administrateur" : "rétrograder en client";
    if (!confirm(`Voulez-vous ${action} ${user.firstName} ${user.lastName} ?`)) return;

    setPendingActionId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Échec de la mise à jour");
      toast({
        title: "Rôle mis à jour",
        description: `${user.firstName} est désormais ${newRole === "ADMIN" ? "administrateur" : "client"}.`,
        variant: "success",
      });
      loadUsers();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur inconnue",
        variant: "error",
      });
    } finally {
      setPendingActionId(null);
    }
  };

  const handleResetPassword = async (user: AdminUser) => {
    if (
      !confirm(
        `Envoyer un email de réinitialisation de mot de passe à ${user.email} ?`
      )
    )
      return;

    setPendingActionId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Échec de l'envoi");
      toast({
        title: "Email envoyé",
        description: `Lien de réinitialisation envoyé à ${user.email}.`,
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur inconnue",
        variant: "error",
      });
    } finally {
      setPendingActionId(null);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (
      !confirm(
        `Supprimer définitivement le compte de ${user.firstName} ${user.lastName} ?\nCette action est irréversible.`
      )
    )
      return;

    setPendingActionId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Suppression impossible");
      toast({
        title: "Compte supprimé",
        variant: "success",
      });
      loadUsers();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur inconnue",
        variant: "error",
      });
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading font-bold text-lg">Gestion des utilisateurs</h1>
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Chargement..."
                  : `${meta?.total ?? users.length} utilisateur${(meta?.total ?? users.length) > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                type="search"
                placeholder="Rechercher (nom, email)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button type="submit" variant="outline">
              Rechercher
            </Button>
            {search && (
              <Button type="button" variant="ghost" onClick={handleClearSearch}>
                Effacer
              </Button>
            )}
          </form>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as Role | "");
              setPage(1);
            }}
            className="h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">Tous les rôles</option>
            <option value="ADMIN">Administrateurs</option>
            <option value="CLIENT">Clients</option>
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isPending = pendingActionId === user.id;
                  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
                  return (
                    <TableRow key={user.id} data-state={isSelf ? "selected" : undefined}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-brand-beige flex items-center justify-center text-brand-brown font-semibold shrink-0">
                            {initials || <UserIcon className="size-5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {user.firstName} {user.lastName}
                              {isSelf && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Vous
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <a
                            href={`mailto:${user.email}`}
                            className="hover:text-primary truncate block max-w-[200px]"
                          >
                            {user.email}
                          </a>
                          {user.phone && (
                            <a
                              href={`tel:${user.phone}`}
                              className="text-xs text-muted-foreground hover:text-primary"
                            >
                              {user.phone}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "ADMIN" ? "default" : "secondary"}
                          className={user.role === "ADMIN" ? "gap-1 bg-brand-orange hover:bg-brand-orange" : ""}
                        >
                          {user.role === "ADMIN" && <Shield className="size-3" />}
                          {user.role === "ADMIN" ? "Admin" : "Client"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user._count.orders}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isPending && (
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRoleToggle(user)}
                            disabled={isSelf || isPending}
                            aria-label={
                              user.role === "ADMIN" ? "Rétrograder en client" : "Promouvoir en admin"
                            }
                            title={
                              isSelf
                                ? "Vous ne pouvez pas modifier votre propre rôle"
                                : user.role === "ADMIN"
                                ? "Rétrograder en client"
                                : "Promouvoir en administrateur"
                            }
                          >
                            {user.role === "ADMIN" ? (
                              <ShieldOff className="size-4" />
                            ) : (
                              <Shield className="size-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResetPassword(user)}
                            disabled={isPending}
                            aria-label="Envoyer un email de réinitialisation"
                            title="Envoyer un email de réinitialisation du mot de passe"
                          >
                            <KeyRound className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user)}
                            disabled={isSelf || isPending}
                            className="text-destructive disabled:text-muted-foreground"
                            aria-label="Supprimer"
                            title={
                              isSelf
                                ? "Vous ne pouvez pas supprimer votre propre compte"
                                : "Supprimer ce compte"
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!loading && users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé.
                    </TableCell>
                  </TableRow>
                )}
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

        {/* Légende */}
        <div className="mt-6 grid sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Shield className="size-4 mt-0.5 text-brand-orange shrink-0" />
            <p>Cliquer pour promouvoir un client en administrateur, ou rétrograder un admin.</p>
          </div>
          <div className="flex items-start gap-2">
            <KeyRound className="size-4 mt-0.5 text-blue-600 shrink-0" />
            <p>Envoie au client un email avec un lien de réinitialisation du mot de passe (valide 1h).</p>
          </div>
          <div className="flex items-start gap-2">
            <Trash2 className="size-4 mt-0.5 text-destructive shrink-0" />
            <p>Supprime définitivement le compte. Impossible si le client a des commandes.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
