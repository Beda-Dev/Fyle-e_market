"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  Upload,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  imagePublicId: string | null;
  _count?: { products: number };
}

interface FormState {
  id: string | null;
  name: string;
  slug: string;
  description: string;
  image: string;
  imagePublicId: string;
}

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  slug: "",
  description: "",
  image: "",
  imagePublicId: "",
};

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCategories = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setModalOpen(true);
  };

  const openEdit = (category: AdminCategory) => {
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image: category.image ?? "",
      imagePublicId: category.imagePublicId ?? "",
    });
    setSlugTouched(true); // pas d'auto-slug en édition
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving || uploading) return;
    setModalOpen(false);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: slugify(value) }));
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload échoué");
      setForm((prev) => ({
        ...prev,
        image: json.data.url,
        imagePublicId: json.data.publicId,
      }));
      toast({ title: "Image uploadée", variant: "success" });
    } catch (e) {
      toast({
        title: "Erreur d'upload",
        description: e instanceof Error ? e.message : "Erreur inconnue",
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Nom et slug requis", variant: "warning" });
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        image: form.image || null,
        imagePublicId: form.imagePublicId || null,
      };
      const url = form.id
        ? `/api/admin/categories/${form.id}`
        : `/api/admin/categories`;
      const method = form.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Échec");
      toast({
        title: form.id ? "Catégorie modifiée" : "Catégorie créée",
        variant: "success",
      });
      setModalOpen(false);
      loadCategories();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur inconnue",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: AdminCategory) => {
    const ok = await confirm({
      title: `Supprimer la catégorie "${category.name}" ?`,
      description: "Cette action est irréversible.",
      confirmLabel: "Supprimer",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Suppression impossible");
      toast({ title: "Catégorie supprimée", variant: "success" });
      loadCategories();
    } catch (e) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Erreur inconnue",
        variant: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-heading font-bold text-lg">Gestion des catégories</h1>
                <p className="text-sm text-muted-foreground">
                  {loading
                    ? "Chargement..."
                    : `${categories.length} catégorie${categories.length > 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <Button onClick={openCreate} className="gap-2">
              <Plus className="size-4" />
              Nouvelle catégorie
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Produits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="relative size-14 rounded-md overflow-hidden bg-muted">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center">
                            <ImageIcon className="size-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{category.name}</p>
                      {category.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                          {category.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{category.slug}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{category._count?.products ?? 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(category)}
                          aria-label="Modifier"
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category)}
                          className="text-destructive"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucune catégorie. Créez-en une avec le bouton « Nouvelle catégorie ».
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Modal Create/Edit */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 bg-card rounded-xl shadow-xl border"
              role="dialog"
              aria-modal="true"
              aria-labelledby="category-modal-title"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 id="category-modal-title" className="font-heading font-semibold text-lg">
                  {form.id ? "Modifier la catégorie" : "Nouvelle catégorie"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeModal}
                  disabled={saving || uploading}
                  aria-label="Fermer"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cat-name" className="text-brand-brown">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cat-name"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Électronique"
                    required
                    className="h-10"
                  />
                </div>

                {/* Slug masqué : généré automatiquement depuis le nom */}
                <input type="hidden" name="cat-slug" value={form.slug} />

                <div className="flex flex-col gap-2">
                  <Label htmlFor="cat-desc" className="text-brand-brown">
                    Description
                  </Label>
                  <textarea
                    id="cat-desc"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    maxLength={500}
                    placeholder="Brève description de la catégorie..."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-brand-brown">Image</Label>
                  {form.image ? (
                    <div className="relative">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
                        <Image
                          src={form.image}
                          alt="Aperçu"
                          fill
                          className="object-cover"
                          sizes="500px"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 gap-1"
                        onClick={() =>
                          setForm({ ...form, image: "", imagePublicId: "" })
                        }
                      >
                        <X className="size-4" />
                        Retirer
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="size-6 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Upload en cours...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="size-6 text-muted-foreground" />
                          <p className="text-sm font-medium">Cliquer pour uploader</p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG, WebP — 10 Mo max
                          </p>
                        </div>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                      e.target.value = "";
                    }}
                  />
                </div>
              </form>

              <div className="flex justify-end gap-2 p-4 border-t bg-muted/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={saving || uploading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={saving || uploading || !form.name.trim() || !form.slug.trim()}
                  className="gap-2"
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {form.id ? "Enregistrer" : "Créer"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
