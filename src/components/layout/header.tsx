"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Menu,
  Search,
  User,
  Heart,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart-store";
import type { Category } from "@/lib/mock-data";
import { CartDrawer } from "./cart-drawer";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Boutique" },
  { href: "/categories", label: "Catégories", hasDropdown: true },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { items, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []))
      .catch(() => setCategories([]));
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        {/* Top bar */}
        {/* <div className="hidden lg:block bg-[#73442A] text-white py-2">
          <div className="container mx-auto px-4 flex items-center justify-between text-sm">
            <p>Livraison gratuite pour les commandes de plus de 50 000 FCFA</p>
            <div className="flex items-center gap-6">
              <Link href="/track-order" className="hover:text-[#F9DEC9] transition-colors">
                Suivre ma commande
              </Link>
              <Link href="/help" className="hover:text-[#F9DEC9] transition-colors">
                Aide
              </Link>
            </div>
          </div>
        </div> */}

        {/* Main header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10 lg:w-12 lg:h-12">
                <Image
                  src="/logo eburnie.png"
                  alt="Eburnie"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-heading font-bold text-lg lg:text-xl text-[#73442A]">
                Eburnie
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() =>
                    link.hasDropdown && setIsCategoriesOpen(true)
                  }
                  onMouseLeave={() =>
                    link.hasDropdown && setIsCategoriesOpen(false)
                  }
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 text-foreground/80 hover:text-primary font-medium transition-colors"
                  >
                    {link.label}
                    {link.hasDropdown && (
                      <ChevronDown className="transition-transform" data-icon />
                    )}
                  </Link>

                  {/* Categories Dropdown */}
                  {link.hasDropdown && (
                    <AnimatePresence>
                      {isCategoriesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 pt-2 w-64"
                        >
                          <div className="bg-card rounded-xl shadow-lg border p-2">
                            {categories.map((category) => (
                              <Link
                                key={category.id}
                                href={`/products?category=${category.slug}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
                              >
                                <span className="text-sm font-medium">
                                  {category.name}
                                </span>
                                {typeof category.productCount === "number" && (
                                  <Badge variant="secondary" className="ml-auto text-xs">
                                    {category.productCount}
                                  </Badge>
                                )}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-icon />
                <Input
                  type="search"
                  placeholder="Rechercher un produit..."
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search button - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Rechercher"
              >
                <Search data-icon />
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex"
                aria-label="Liste de souhaits"
              >
                <Heart data-icon />
              </Button>

              {/* Account */}
              {status === "authenticated" ? (
                <div
                  className="relative hidden sm:block"
                  onMouseEnter={() => setIsAccountOpen(true)}
                  onMouseLeave={() => setIsAccountOpen(false)}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Mon compte"
                  >
                    <User data-icon />
                  </Button>
                  <AnimatePresence>
                    {isAccountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full pt-2 w-56"
                      >
                        <div className="bg-card rounded-xl shadow-lg border p-2">
                          <div className="px-3 py-2 border-b mb-1">
                            <p className="text-sm font-medium truncate">
                              {session?.user?.name || session?.user?.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isAdmin ? "Administrateur" : "Client"}
                            </p>
                          </div>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm"
                            >
                              <ShieldCheck className="size-4" />
                              Tableau de bord
                            </Link>
                          )}
                          <Link
                            href="/orders"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm"
                          >
                            <Package className="size-4" />
                            Mes commandes
                          </Link>
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm text-destructive"
                          >
                            <LogOut className="size-4" />
                            Se deconnecter
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium hover:text-primary"
                >
                  <User data-icon />
                  Connexion
                </Link>
              )}

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={openCart}
                aria-label="Panier"
              >
                <ShoppingCart data-icon />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger 
                  render={
                                     <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Menu"
                  >
                    <Menu data-icon />
                  </Button>
                  }
 
                />
                <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle className="text-left font-heading">Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-medium py-2 border-b border-border hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="pt-4 flex flex-col gap-3">
                      {<Button variant="outline" className="w-full justify-start gap-2">
                        <User data-icon="inline-start" />
                        Mon compte
                      </Button>}
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Heart data-icon="inline-start" />
                        Liste de souhaits
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-28" />
    </>
  );
}
