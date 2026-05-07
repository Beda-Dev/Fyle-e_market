"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PromoBannerSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Large promo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-[#73442A] min-h-[350px] lg:min-h-[450px]"
          >
            <Image
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
              alt="Nouvelle collection"
              fill
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#73442A] via-[#73442A]/80 to-transparent" />
            <div className="relative z-10 p-8 lg:p-12 flex flex-col justify-center h-full max-w-md">
              <span className="inline-block px-3 py-1 rounded-full bg-[#F07C1E] text-white text-xs font-medium w-fit mb-4">
                Offre Limitée
              </span>
              <h3 className="font-heading font-bold text-3xl lg:text-4xl text-white mb-4 text-balance">
                Jusqu&apos;à -30% sur la collection Tech
              </h3>
              <p className="text-white/80 mb-6">
                Profitez de nos meilleures offres sur les gadgets et accessoires high-tech.
              </p>
              <Button asChild variant="secondary" className="w-fit">
                <Link href="/products?category=electronique&sale=true">
                  Découvrir
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Two smaller promos */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-[#F9DEC9] flex-1 min-h-[200px]"
            >
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"
                alt="Mode tendance"
                fill
                className="object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F9DEC9] to-transparent" />
              <div className="relative z-10 p-6 lg:p-8 flex flex-col justify-center h-full">
                <h4 className="font-heading font-bold text-2xl text-[#73442A] mb-2">
                  Mode Tendance
                </h4>
                <p className="text-[#73442A]/70 text-sm mb-4">
                  Les dernières tendances de la saison
                </p>
                <Link
                  href="/products?category=mode-vetements"
                  className="flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all"
                >
                  Explorer
                  <ArrowRight data-icon />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-[#E8B287]/30 flex-1 min-h-[200px]"
            >
              <Image
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600"
                alt="Maison & Déco"
                fill
                className="object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#E8B287]/80 to-transparent" />
              <div className="relative z-10 p-6 lg:p-8 flex flex-col justify-center h-full">
                <h4 className="font-heading font-bold text-2xl text-[#73442A] mb-2">
                  Maison & Déco
                </h4>
                <p className="text-[#73442A]/70 text-sm mb-4">
                  Sublimez votre intérieur
                </p>
                <Link
                  href="/products?category=maison-deco"
                  className="flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all"
                >
                  Découvrir
                  <ArrowRight data-icon />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
