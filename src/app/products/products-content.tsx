"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductCard } from "@/components/products/product-card";
import type { Category, Product } from "@/lib/mock-data";

const sortOptions = [
  { value: "newest", label: "Plus récents" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
];

const priceRanges = [
  { id: "0-25000", label: "Moins de 25 000 FCFA", min: 0, max: 25000 },
  { id: "25000-50000", label: "25 000 - 50 000 FCFA", min: 25000, max: 50000 },
  { id: "50000-100000", label: "50 000 - 100 000 FCFA", min: 50000, max: 100000 },
  { id: "100000+", label: "Plus de 100 000 FCFA", min: 100000, max: Infinity },
];

interface ProductsContentProps {
  products: Product[];
  categories: Category[];
}

export function ProductsContent({ products, categories }: ProductsContentProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Synchronise depuis l'URL si l'utilisateur relance une recherche depuis le header
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isActive);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.category.slug === selectedCategory);
    }

    // Price filter
    if (selectedPriceRange) {
      const range = priceRanges.find((r) => r.id === selectedPriceRange);
      if (range) {
        result = result.filter(
          (p) => p.price >= range.min && p.price < range.max
        );
      }
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedPriceRange, sortBy]);

  const activeFiltersCount = [selectedCategory, selectedPriceRange].filter(
    Boolean
  ).length;

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedPriceRange("");
    setSearchQuery("");
  };

  const FilterContent = () => (
    <div className="flex flex-col gap-6">
      {/* Categories */}
      <div>
        <h3 className="font-heading font-semibold mb-3">Catégories</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === ""
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            Toutes les catégories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category.slug
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <span>{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                {category.productCount}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-heading font-semibold mb-3">Prix</h3>
        <div className="flex flex-col gap-2">
          {priceRanges.map((range) => (
            <button
              key={range.id}
              onClick={() =>
                setSelectedPriceRange(
                  selectedPriceRange === range.id ? "" : range.id
                )
              }
              className={`text-left px-3 py-2 rounded-lg transition-colors ${
                selectedPriceRange === range.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Clear filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Effacer les filtres ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl lg:text-4xl text-brand-brown">
          {selectedCategory
            ? categories.find((c) => c.slug === selectedCategory)?.name ||
              "Boutique"
            : "Tous nos produits"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {filteredProducts.length} produit
          {filteredProducts.length > 1 ? "s" : ""} trouvé
          {filteredProducts.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" data-icon />
          <Input
            type="search"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Mobile Filters */}
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger>
              <Button variant="outline" className="lg:hidden gap-2">
                <SlidersHorizontal data-icon="inline-start" />
                Filtres
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1">{activeFiltersCount}</Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => value && setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* View mode */}
          <div className="hidden sm:flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 data-icon />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
              onClick={() => setViewMode("list")}
            >
              <List data-icon />
            </Button>
          </div>
        </div>
      </div>

      {/* Active filters badges */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-6">
          <span className="text-sm text-muted-foreground">Filtres actifs:</span>
          {selectedCategory && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/10"
              onClick={() => setSelectedCategory("")}
            >
              {categories.find((c) => c.slug === selectedCategory)?.name}
              <X className="size-3" />
            </Badge>
          )}
          {selectedPriceRange && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/10"
              onClick={() => setSelectedPriceRange("")}
            >
              {priceRanges.find((r) => r.id === selectedPriceRange)?.label}
              <X className="size-3" />
            </Badge>
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:underline"
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-32 bg-card rounded-xl border p-6">
            <h2 className="font-heading font-semibold text-lg mb-6">Filtres</h2>
            <FilterContent />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="size-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="text-muted-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-muted-foreground mb-4">
                Essayez de modifier vos critères de recherche ou de supprimer
                certains filtres.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
