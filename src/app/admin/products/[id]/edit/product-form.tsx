"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Camera,
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  Star,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CameraCapture } from "@/components/admin/camera-capture"
import { formatPriceInput, parsePriceInput, type Category } from "@/lib/mock-data"
import type { Product } from "@prisma/client"

// ─── slugify ─────────────────────────────────────────────────────────────
function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

interface PendingImage {
  id: string
  file: File
  previewUrl: string
}

interface UploadedImage {
  publicId: string
  url: string
}

interface ProductFormProps {
  product: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [cameraOpen, setCameraOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // form state - pré-rempli avec les données du produit
  const [name, setName] = useState(product.name)
  const [slug, setSlug] = useState(product.slug)
  const [slugTouched, setSlugTouched] = useState(false)
  const [description, setDescription] = useState(product.description)
  const [price, setPrice] = useState(formatPriceInput(product.price.toString()))
  const [originalPrice, setOriginalPrice] = useState(formatPriceInput(product.originalPrice.toString()))
  const [stock, setStock] = useState(product.stock.toString())
  const [categoryId, setCategoryId] = useState(product.categoryId)
  const [isFeatured, setIsFeatured] = useState(product.isFeatured)
  const [isNew, setIsNew] = useState(product.isNew)
  const [isActive, setIsActive] = useState(product.isActive)
  const [images, setImages] = useState<PendingImage[]>([])

  // Images existantes du produit (image principale en premier, puis galerie)
  const [existingImages, setExistingImages] = useState<string[]>(() => {
    const gallery = (product.images as string[]) || []
    const main = product.imageUrl
    // Évite les doublons si imageUrl est déjà dans la galerie
    return main ? [main, ...gallery.filter((u) => u !== main)] : gallery
  })

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []))
  }, [])

  // auto-slug si l'admin n'a pas modifie le slug manuellement
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  // cleanup blob URLs
  useEffect(() => {
    return () => {
      images.forEach((i) => URL.revokeObjectURL(i.previewUrl))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addFiles = (newFiles: File[]) => {
    const valid = newFiles.filter((f) => f.type.startsWith("image/"))
    const items: PendingImage[] = valid.map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
    }))
    setImages((prev) => [...prev, ...items])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    addFiles(Array.from(e.target.files))
    e.target.value = "" // permet de re-selectionner les memes fichiers
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files))
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
  }

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url))
  }

  const moveImage = (id: string, direction: "up" | "down") => {
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === id)
      if (idx === -1) return prev
      const targetIdx = direction === "up" ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[targetIdx]] = [next[targetIdx], next[idx]]
      return next
    })
  }

  const setMainImage = (id: string) => {
    setImages((prev) => {
      const idx = prev.findIndex((i) => i.id === id)
      if (idx <= 0) return prev
      const next = [...prev]
      const [item] = next.splice(idx, 1)
      next.unshift(item)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Vérifier qu'il y a au moins une image (existante ou nouvelle)
    const totalImages = existingImages.length + images.length
    if (totalImages === 0) {
      setError("Ajoute au moins une image")
      return
    }
    if (!categoryId) {
      setError("Selectionne une categorie")
      return
    }
    const priceNum = parsePriceInput(price)
    const origPriceNum = parsePriceInput(originalPrice) || priceNum
    if (!priceNum || priceNum <= 0) {
      setError("Le prix doit etre positif")
      return
    }

    setSubmitting(true)
    try {
      // 1) Upload des nouvelles images si présentes
      let uploadedUrls: string[] = []
      let newMainPublicId: string | null = null
      if (images.length > 0) {
        const fd = new FormData()
        for (const img of images) fd.append("files", img.file)
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        })
        const uploadJson = await uploadRes.json()
        if (!uploadRes.ok) {
          throw new Error(uploadJson.error || "Upload echoue")
        }
        const uploaded: UploadedImage[] = Array.isArray(uploadJson.data)
          ? uploadJson.data
          : [uploadJson.data]
        uploadedUrls = uploaded.map((u) => u.url)
        newMainPublicId = uploaded[0]?.publicId ?? null
      }

      // 2) Construire la liste finale ordonnée (existantes + nouvelles)
      const allImages = [...existingImages, ...uploadedUrls]
      if (allImages.length === 0) {
        throw new Error("Ajoute au moins une image")
      }
      const finalImageUrl = allImages[0]
      const finalGallery = allImages.slice(1)
      // Le publicId principal change uniquement si l'image principale a changé
      const finalImagePublicId =
        finalImageUrl === product.imageUrl
          ? product.imagePublicId
          : uploadedUrls.includes(finalImageUrl)
          ? newMainPublicId
          : null

      // 3) Mettre à jour le produit
      const updateRes = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          price: priceNum,
          originalPrice: origPriceNum,
          stock: Number(stock),
          imageUrl: finalImageUrl,
          imagePublicId: finalImagePublicId,
          images: finalGallery,
          isFeatured,
          isNew,
          isActive,
          categoryId,
        }),
      })
      const updateJson = await updateRes.json()
      if (!updateRes.ok) {
        throw new Error(updateJson.error || "Mise à jour echouee")
      }

      toast({ title: "Produit modifié", description: "Les modifications ont été enregistrées.", variant: "success" })
      router.push("/admin/products")
      router.refresh()
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : "Une erreur est survenue", variant: "error" })
      setError(e instanceof Error ? e.message : "Une erreur est survenue")
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/products">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading font-bold text-lg">Modifier le produit</h1>
              <p className="text-sm text-muted-foreground">
                {product.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="max-w-3xl mx-auto">

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* ─── Images existantes ─── */}
            {existingImages.length > 0 && (
              <section className="flex flex-col gap-3">
                <Label style={{ color: "var(--color-brand-brown)" }} className="font-medium">
                  Images actuelles
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {existingImages.map((url, idx) => (
                    <div
                      key={url}
                      className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
                          <Star className="size-3 fill-current" />
                          Principale
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="size-8 rounded-full bg-destructive hover:bg-destructive/90 text-white flex items-center justify-center"
                          title="Supprimer"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── Nouvelles images ─── */}
            <section className="flex flex-col gap-3">
              <Label style={{ color: "var(--color-brand-brown)" }} className="font-medium">
                Ajouter de nouvelles photos
              </Label>

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="size-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Glisse tes images ici ou
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, WebP - 10 Mo max par image
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="size-4" />
                      Choisir des fichiers
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCameraOpen(true)}
                      className="gap-2"
                    >
                      <Camera className="size-4" />
                      Prendre une photo
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview grid */}
              <AnimatePresence>
                {images.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                  >
                    {images.map((img, idx) => (
                      <motion.div
                        key={img.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.previewUrl}
                          alt={`Image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveImage(img.id, "up")}
                            disabled={idx === 0}
                            className="size-8 rounded-full bg-white/90 hover:bg-white text-foreground flex items-center justify-center disabled:opacity-30"
                            title="Monter"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(img.id, "down")}
                            disabled={idx === images.length - 1}
                            className="size-8 rounded-full bg-white/90 hover:bg-white text-foreground flex items-center justify-center disabled:opacity-30"
                            title="Descendre"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="size-8 rounded-full bg-destructive hover:bg-destructive/90 text-white flex items-center justify-center"
                            title="Supprimer"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* ─── Champs ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex flex-col gap-2">
                <Label htmlFor="name" style={{ color: "var(--color-brand-brown)" }}>
                  Nom du produit
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Casque audio sans fil premium"
                  required
                  className="h-11"
                />
              </div>

              {/* Slug masqué : généré automatiquement depuis le nom */}
              <input type="hidden" name="slug" value={slug} />

              <div className="sm:col-span-2 flex flex-col gap-2">
                <Label htmlFor="description" style={{ color: "var(--color-brand-brown)" }}>
                  Description
                </Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Decris le produit, ses caracteristiques..."
                  required
                  rows={4}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="price" style={{ color: "var(--color-brand-brown)" }}>
                  Prix (FCFA)
                </Label>
                <Input
                  id="price"
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(formatPriceInput(e.target.value))}
                  placeholder="89 990"
                  required
                  className="h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="originalPrice" style={{ color: "var(--color-brand-brown)" }}>
                  Prix barre (optionnel)
                </Label>
                <Input
                  id="originalPrice"
                  type="text"
                  inputMode="numeric"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(formatPriceInput(e.target.value))}
                  placeholder="119 990"
                  className="h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="stock" style={{ color: "var(--color-brand-brown)" }}>
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="categoryId" style={{ color: "var(--color-brand-brown)" }}>
                  Categorie
                </Label>
                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="h-11 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="">-- Choisir --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ─── Toggles ─── */}
            <div className="flex flex-wrap gap-3">
              <ToggleChip
                active={isFeatured}
                onClick={() => setIsFeatured((v) => !v)}
                icon={<Star className="size-4" />}
                label="En vedette"
              />
              <ToggleChip
                active={isNew}
                onClick={() => setIsNew((v) => !v)}
                icon={<Sparkles className="size-4" />}
                label="Nouveaute"
              />
              <ToggleChip
                active={isActive}
                onClick={() => setIsActive((v) => !v)}
                icon={isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                label={isActive ? "Visible" : "Masque"}
              />
            </div>

            {/* ─── Actions ─── */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t">
              <Link href="/admin/products">
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto gap-2 min-w-[180px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.main>

      {/* Camera modal */}
      <CameraCapture
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => addFiles([file])}
      />
    </div>
  )
}

// Petit composant inline pour les toggles
function ToggleChip({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 text-sm font-medium transition-all ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border hover:border-primary/50 text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
