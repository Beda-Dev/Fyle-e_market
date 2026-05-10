import { Header, Footer } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Truck, Star } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Passion",
    description:
      "Nous sélectionnons chaque produit avec soin pour vous offrir le meilleur.",
  },
  {
    icon: Shield,
    title: "Confiance",
    description:
      "Paiement sécurisé et service client disponible pour vous accompagner.",
  },
  {
    icon: Truck,
    title: "Livraison rapide",
    description:
      "Nous livrons vos commandes dans les meilleurs délais partout en Côte d'Ivoire.",
  },
  {
    icon: Star,
    title: "Qualité",
    description:
      "Des produits de qualité premium à des prix accessibles pour tous.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <a href="/" className="hover:text-foreground transition-colors">
              Accueil
            </a>
            <span>/</span>
            <span className="text-foreground">À propos</span>
          </nav>

          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="font-heading font-bold text-3xl text-brand-brown mb-4">
              À propos d&apos;Eburnie
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Eburnie est votre destination shopping en ligne pour des produits
              de qualité. Nous nous engageons à offrir une expérience d&apos;achat
              moderne, élégante et intuitive à tous nos clients.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <Card key={v.title}>
                  <CardContent className="p-6 text-center">
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-bold text-lg text-brand-brown mb-2">
                      {v.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {v.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <h2 className="font-heading font-bold text-xl text-brand-brown mb-4">
                  Notre mission
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Chez Eburnie, notre mission est de rendre le commerce en ligne
                  accessible et agréable pour tous. Nous croyons que chaque
                  client mérite une expérience d&apos;achat exceptionnelle, des
                  produits de qualité et un service irréprochable.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Fondée avec la vision de transformer le e-commerce en Côte
                  d&apos;Ivoire, Eburnie s&apos;efforce chaque jour d&apos;innover et
                  d&apos;améliorer ses services pour mieux vous servir.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
