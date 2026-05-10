"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Truck, Shield, Clock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Truck,
    title: "Livraison Rapide",
    description: "Partout en Côte d'Ivoire",
  },
  {
    icon: Shield,
    title: "Paiement Sécurisé",
    description: "Transactions 100% sécurisées",
  },
  {
    icon: Clock,
    title: "Support 24/7",
    description: "À votre écoute",
  },
  {
    icon: CreditCard,
    title: "Paiement à la Livraison",
    description: "Payez cash",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Main Hero */}
      <div className="relative min-h-[600px] lg:min-h-[700px] bg-gradient-to-br from-[#F9DEC9] via-[#F9DEC9]/50 to-white">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Nouvelle Collection {new Date().getFullYear()}
              </span>
              <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-brand-brown leading-tight text-balance">
                Découvrez le meilleur du shopping en ligne
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
                Une sélection exclusive de produits de qualité pour tous vos besoins. 
                Profitez d&apos;une expérience d&apos;achat unique et personnalisée.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button size="lg"  className="text-base">
                  <Link href="/products">
                    Explorer la boutique
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base">
                  <Link href="/categories">
                    Voir les catégories
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-12">
                <div>
                  <p className="font-heading font-bold text-3xl text-brand-brown">500+</p>
                  <p className="text-sm text-muted-foreground">Produits</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div>
                  <p className="font-heading font-bold text-3xl text-brand-brown">10K+</p>
                  <p className="text-sm text-muted-foreground">Clients satisfaits</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div>
                  <p className="font-heading font-bold text-3xl text-brand-brown">99%</p>
                  <p className="text-sm text-muted-foreground">Avis positifs</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:w-1/2"
            >
              <div className="relative aspect-square max-w-lg mx-auto lg:max-w-none">
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 size-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-8 -left-8 size-48 rounded-full bg-[#E8B287]/30 blur-2xl" />
                
                {/* Main image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop"
                    alt="Shopping experience"
                    width={600}
                    height={600}
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Floating cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="absolute -left-4 bottom-24 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3"
                >
                  <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Truck className="text-green-600" data-icon />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Livraison Express</p>
                    <p className="text-xs text-muted-foreground">En 24-48h</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -right-4 top-24 bg-white rounded-xl shadow-lg p-4"
                >
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="size-4 fill-amber-400 text-amber-400"
                        viewBox="0 0 24 24"
                      >
                        <polygon points="12,2 15,8.5 22,9.5 17,14.5 18,22 12,18.5 6,22 7,14.5 2,9.5 9,8.5" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm font-medium mt-1">4.9/5 Satisfaction</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features bar */}
      <div className="bg-brand-brown text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <feature.icon className="text-brand-orange" data-icon />
                </div>
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-white/70">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
