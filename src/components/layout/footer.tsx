import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  shop: [
    { label: "Nouveautés", href: "/products?sort=newest" },
    { label: "Meilleures ventes", href: "/products?sort=popular" },
    { label: "Promotions", href: "/products?sale=true" },
    { label: "Toutes les catégories", href: "/categories" },
  ],
  support: [
    { label: "Centre d'aide", href: "/help" },
    { label: "Livraison", href: "/shipping" },
    { label: "Retours & Échanges", href: "/returns" },
    { label: "Suivre ma commande", href: "/track-order" },
  ],
  company: [
    { label: "À propos", href: "/about" },
    { label: "Carrières", href: "/careers" },
    { label: "Presse", href: "/press" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "CGV", href: "/terms" },
    { label: "Politique de confidentialité", href: "/privacy" },
    { label: "Cookies", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
];

export function Footer() {
  return (
    <footer className="bg-[#73442A] text-white mt-auto">
      {/* Newsletter section */}
      <div className="bg-[#5D3622]">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="font-heading font-bold text-2xl mb-2">
                Rejoignez notre newsletter
              </h3>
              <p className="text-white/80">
                Recevez nos offres exclusives et nouveautés en avant-première
              </p>
            </div>
            <form className="flex gap-2 w-full max-w-md">
              <Input
                type="email"
                placeholder="Votre adresse email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-[#F07C1E]"
              />
              <Button className="bg-[#F07C1E] hover:bg-[#D96A0E] text-white flex-shrink-0">
                {"S'inscrire"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative size-12 bg-white rounded-lg p-1">
                <Image
                  src="/logo fyle market.png"
                  alt="FYLE MARKET"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-heading font-bold text-xl">FYLE MARKET</span>
            </Link>
            <p className="text-white/70 text-sm mb-6 max-w-xs">
              Votre destination shopping en ligne pour des produits de qualité. 
              Une expérience d&apos;achat moderne, élégante et intuitive.
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <a
                href="tel:+221000000000"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <Phone data-icon />
                +221 00 000 00 00
              </a>
              <a
                href="mailto:contact@fylemarket.com"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <Mail data-icon />
                contact@fylemarket.com
              </a>
              <span className="flex items-center gap-2 text-white/70">
                <MapPin data-icon />
                Dakar, Sénégal
              </span>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Boutique</h4>
            <ul className="flex flex-col gap-3">
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

          {/* Support links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Support</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.support.map((link) => (
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
            <h4 className="font-heading font-semibold mb-4">Entreprise</h4>
            <ul className="flex flex-col gap-3">
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

          {/* Legal links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Légal</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.legal.map((link) => (
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

        <Separator className="my-8 bg-white/20" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60 text-center md:text-left">
            © {new Date().getFullYear()} FYLE MARKET. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="size-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#F07C1E] transition-colors"
                aria-label={social.label}
              >
                <social.icon data-icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
