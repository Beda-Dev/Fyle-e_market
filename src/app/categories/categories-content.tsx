import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count: {
    products: number;
  };
}

interface CategoriesContentProps {
  categories: Category[];
}

export function CategoriesContent({ categories }: CategoriesContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Accueil
        </Link>
        <ArrowRight className="size-4" />
        <span className="text-foreground">Catégories</span>
      </nav>

      <h1 className="font-heading font-bold text-3xl text-brand-brown mb-8">
        Nos catégories
      </h1>

      {categories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Aucune catégorie disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="group cursor-pointer hover:border-brand-orange transition-colors overflow-hidden">
                {category.image ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                ) : (
                  <div className="h-48 bg-muted flex items-center justify-center">
                    <div className="size-20 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                      <span className="text-4xl font-heading font-bold text-muted-foreground/30">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                <CardContent className="p-4">
                  <h2 className="font-heading font-bold text-lg text-brand-brown mb-2">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {category._count.products} produit{category._count.products > 1 ? "s" : ""}
                    </span>
                    <span className="text-primary flex items-center gap-1 text-sm group-hover:gap-2 transition-all">
                      Voir
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
