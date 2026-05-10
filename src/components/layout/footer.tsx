"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SiteSettings {
  customerService: string;
  email: string | null;
  whatsapp: string | null;
  slogan: string;
  location: string | null;
}

const footerLinks = {
  shop: [
    { label: "Tous les produits", href: "/products" },
    { label: "Catégories", href: "/categories" },
    { label: "Favoris", href: "/favorites" },
  ],
  account: [
    { label: "Mon compte", href: "/profile" },
    { label: "Mes commandes", href: "/orders" },
    { label: "Mon panier", href: "/cart" },
  ],
  company: [
    { label: "À propos", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((res) => { if (res.data) setSettings(res.data); });
  }, []);

  return (
    <footer className="bg-brand-brown text-white mt-auto">
      {/* Newsletter section */}
      {/* <div className="bg-[#5D3622]">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="font-heading font-bold text-xl mb-2">
                Rejoignez notre newsletter
              </h3>
              <p className="text-white/80 text-sm">
                Recevez nos offres exclusives en avant-première
              </p>
            </div>
            <form className="flex gap-2 w-full max-w-md">
              <Input
                type="email"
                placeholder="Votre adresse email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-brand-orange"
              />
              <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white shrink-0">
                {"S'inscrire"}
              </Button>
            </form>
          </div>
        </div>
      </div> */}

      {/* Main footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative size-10 bg-white rounded-lg p-1">
                <Image
                  src="/logo-eburnie.png"
                  alt="Eburnie"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-heading font-bold text-lg">Eburnie</span>
            </Link>
            <p className="text-white/70 text-sm mb-4">
              {settings?.slogan || "Votre destination shopping en ligne pour des produits de qualité."}
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href={`tel:${settings?.customerService || "+225000000000"}`}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <Phone className="size-4" />
                {settings?.customerService || "+225 00 00 00 00 00"}
              </a>
              {(settings?.email) && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <Mail className="size-4" />
                  {settings.email}
                </a>
              )}
              <span className="flex items-center gap-2 text-white/70">
                <MapPin className="size-4" />
                {settings?.location || "Abidjan, Côte d'Ivoire"}
              </span>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Boutique</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Mon compte</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Entreprise</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-6 bg-white/20" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60 text-center md:text-left">
            © {new Date().getFullYear()} Eburnie. Tous droits réservés.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="size-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-orange transition-colors"
              aria-label="Site web"
            >
              <Globe className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
