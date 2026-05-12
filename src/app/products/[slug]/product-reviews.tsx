"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string };
}

interface ReviewsMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  averageRating: number;
  totalReviews: number;
}

interface ProductReviewsProps {
  productSlug: string;
}

function StarRow({
  value,
  size = 16,
  onChange,
}: {
  value: number;
  size?: number;
  onChange?: (rating: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return onChange ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="transition-transform hover:scale-110"
            aria-label={`Noter ${n} étoile${n > 1 ? "s" : ""}`}
          >
            <Star
              style={{ width: size, height: size }}
              className={filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
            />
          </button>
        ) : (
          <Star
            key={n}
            style={{ width: size, height: size }}
            className={filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}
          />
        );
      })}
    </div>
  );
}

export function ProductReviews({ productSlug }: ProductReviewsProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [meta, setMeta] = useState<ReviewsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(
    async (targetPage: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products/${productSlug}/reviews?page=${targetPage}&pageSize=10`
        );
        const json = await res.json();
        setReviews(json.data ?? []);
        setMeta(json.meta ?? null);
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setLoading(false);
      }
    },
    [productSlug]
  );

  useEffect(() => {
    fetchReviews(page);
  }, [fetchReviews, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast({
        title: "Note requise",
        description: "Sélectionnez une note entre 1 et 5 étoiles.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Erreur lors de l'envoi");
      }
      toast({ title: "Merci pour votre avis !" });
      setRating(0);
      setComment("");
      setPage(1);
      fetchReviews(1);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Suppression impossible");
      fetchReviews(page);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <p className="font-heading font-bold text-3xl text-brand-brown">
            {meta && meta.totalReviews > 0
              ? meta.averageRating.toFixed(1)
              : "—"}
          </p>
          <StarRow value={meta?.averageRating ?? 0} size={18} />
          <p className="text-sm text-muted-foreground mt-1">
            {meta?.totalReviews ?? 0} avis
          </p>
        </div>
      </div>

      {/* Form */}
      {session?.user ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">
                  Votre note
                </label>
                <StarRow value={rating} size={28} onChange={setRating} />
              </div>
              <div>
                <label htmlFor="review-comment" className="text-sm font-medium block mb-2">
                  Votre commentaire (optionnel)
                </label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Partagez votre expérience avec ce produit..."
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Envoi..." : "Publier mon avis"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                Connectez-vous
              </Link>{" "}
              pour laisser un avis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-4">
        {loading && reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun avis pour ce produit. Soyez le premier à donner votre opinion !
          </p>
        ) : (
          reviews.map((review) => {
            const canDelete =
              session?.user?.id === review.user.id ||
              session?.user?.role === "ADMIN";
            return (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium">
                          {review.user.firstName} {review.user.lastName.charAt(0)}.
                        </p>
                        <StarRow value={review.rating} size={14} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {formatDate(review.createdAt)}
                      </p>
                      {review.comment && (
                        <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                          {review.comment}
                        </p>
                      )}
                    </div>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(review.id)}
                        aria-label="Supprimer mon avis"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
    </div>
  );
}
