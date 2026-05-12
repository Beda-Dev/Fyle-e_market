import Link from "next/link";
import { Compass, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header, Footer } from "@/components/layout";

export const metadata = {
  title: "Page introuvable",
  description: "La page que vous cherchez n'existe pas ou a été déplacée.",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-gradient-to-br from-brand-beige/40 via-brand-beige/10 to-white">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-xl mx-auto text-center">
            <div className="relative inline-flex items-center justify-center mb-8">
              <div className="absolute size-40 rounded-full bg-brand-orange-light/40 blur-2xl" />
              <div className="relative size-32 rounded-full bg-brand-beige flex items-center justify-center">
                <Compass className="size-14 text-brand-brown" strokeWidth={1.5} />
              </div>
            </div>

            <p className="font-heading font-bold text-7xl lg:text-8xl text-brand-brown tracking-tight">
              404
            </p>
            <h1 className="font-heading font-semibold text-2xl lg:text-3xl text-brand-brown mt-4">
              Page introuvable
            </h1>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
              Cette page n&apos;existe pas, a été déplacée, ou le lien que vous
              avez suivi est cassé. Revenez à l&apos;accueil ou découvrez nos
              produits.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link href="/">
                <Button size="lg" variant="outline" className="gap-2">
                  <ArrowLeft className="size-4" />
                  Retour à l&apos;accueil
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  <ShoppingBag className="size-4" />
                  Voir la boutique
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
