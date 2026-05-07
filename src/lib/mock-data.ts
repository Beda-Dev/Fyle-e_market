// Mock data for FYLE MARKET e-commerce
// TODO: Replace with real API data when backend is ready

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl: string;
  images: string[];
  categoryId: string;
  category: Pick<Category, "name" | "slug">;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  addressLine: string;
  city: string;
  phone: string;
  note?: string;
  items: {
    product: Product;
    quantity: number;
    unitPrice: number;
  }[];
  createdAt: string;
}

// Mock Categories
export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Électronique",
    slug: "electronique",
    description: "Smartphones, ordinateurs, accessoires et gadgets tech",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
    productCount: 24,
  },
  {
    id: "cat-2",
    name: "Mode & Vêtements",
    slug: "mode-vetements",
    description: "Vêtements tendance pour homme et femme",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    productCount: 56,
  },
  {
    id: "cat-3",
    name: "Maison & Déco",
    slug: "maison-deco",
    description: "Meubles, décoration et articles pour la maison",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    productCount: 38,
  },
  {
    id: "cat-4",
    name: "Sport & Loisirs",
    slug: "sport-loisirs",
    description: "Équipements sportifs et articles de loisirs",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800",
    productCount: 19,
  },
  {
    id: "cat-5",
    name: "Beauté & Santé",
    slug: "beaute-sante",
    description: "Cosmétiques, soins et produits de bien-être",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800",
    productCount: 42,
  },
  {
    id: "cat-6",
    name: "Alimentation",
    slug: "alimentation",
    description: "Produits alimentaires de qualité",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
    productCount: 31,
  },
];

// Mock Products
export const products: Product[] = [
  {
    id: "prod-1",
    name: "Casque Audio Sans Fil Premium",
    slug: "casque-audio-sans-fil-premium",
    description:
      "Profitez d'une qualité sonore exceptionnelle avec notre casque sans fil premium. Doté de la technologie de réduction de bruit active, il offre jusqu'à 30 heures d'autonomie et un confort optimal pour une utilisation prolongée.",
    price: 89990,
    originalPrice: 119990,
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800",
    ],
    categoryId: "cat-1",
    category: { name: "Électronique", slug: "electronique" },
    isActive: true,
    isFeatured: true,
    isNew: true,
    rating: 4.8,
    reviewCount: 124,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "prod-2",
    name: "Montre Connectée Elite",
    slug: "montre-connectee-elite",
    description:
      "La montre connectée qui allie élégance et technologie. Suivez votre activité physique, recevez vos notifications et profitez d'une autonomie de 7 jours.",
    price: 149990,
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800",
    ],
    categoryId: "cat-1",
    category: { name: "Électronique", slug: "electronique" },
    isActive: true,
    isFeatured: true,
    isNew: false,
    rating: 4.6,
    reviewCount: 89,
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "prod-3",
    name: "Sac à Main en Cuir Artisanal",
    slug: "sac-main-cuir-artisanal",
    description:
      "Un sac à main confectionné à la main avec du cuir de première qualité. Design intemporel et finitions soignées pour un accessoire qui vous accompagnera pendant des années.",
    price: 79990,
    originalPrice: 99990,
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
    ],
    categoryId: "cat-2",
    category: { name: "Mode & Vêtements", slug: "mode-vetements" },
    isActive: true,
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    reviewCount: 67,
    createdAt: "2024-01-08T10:00:00Z",
  },
  {
    id: "prod-4",
    name: "Lampe de Bureau Design",
    slug: "lampe-bureau-design",
    description:
      "Illuminez votre espace de travail avec cette lampe au design épuré. Luminosité ajustable et bras articulé pour un éclairage optimal.",
    price: 45990,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
    ],
    categoryId: "cat-3",
    category: { name: "Maison & Déco", slug: "maison-deco" },
    isActive: true,
    isFeatured: false,
    isNew: true,
    rating: 4.5,
    reviewCount: 43,
    createdAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "prod-5",
    name: "Sneakers Running Performance",
    slug: "sneakers-running-performance",
    description:
      "Chaussures de running conçues pour la performance. Semelle ultra-légère et amorti optimal pour vos entraînements.",
    price: 69990,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800",
    ],
    categoryId: "cat-4",
    category: { name: "Sport & Loisirs", slug: "sport-loisirs" },
    isActive: true,
    isFeatured: true,
    isNew: false,
    rating: 4.7,
    reviewCount: 156,
    createdAt: "2024-01-05T10:00:00Z",
  },
  {
    id: "prod-6",
    name: "Coffret Soins Visage Bio",
    slug: "coffret-soins-visage-bio",
    description:
      "Un coffret complet de soins naturels pour le visage. Crème hydratante, sérum et masque aux ingrédients biologiques.",
    price: 54990,
    originalPrice: 69990,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
      "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=800",
    ],
    categoryId: "cat-5",
    category: { name: "Beauté & Santé", slug: "beaute-sante" },
    isActive: true,
    isFeatured: false,
    isNew: true,
    rating: 4.8,
    reviewCount: 92,
    createdAt: "2024-01-18T10:00:00Z",
  },
  {
    id: "prod-7",
    name: "Écouteurs Bluetooth Sport",
    slug: "ecouteurs-bluetooth-sport",
    description:
      "Écouteurs intra-auriculaires résistants à l'eau, parfaits pour le sport. Son puissant et maintien sécurisé.",
    price: 39990,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    ],
    categoryId: "cat-1",
    category: { name: "Électronique", slug: "electronique" },
    isActive: true,
    isFeatured: false,
    isNew: false,
    rating: 4.4,
    reviewCount: 78,
    createdAt: "2024-01-12T10:00:00Z",
  },
  {
    id: "prod-8",
    name: "Veste en Jean Vintage",
    slug: "veste-jean-vintage",
    description:
      "Une veste en jean au style rétro avec une coupe moderne. Confortable et polyvalente pour toutes les saisons.",
    price: 59990,
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
    ],
    categoryId: "cat-2",
    category: { name: "Mode & Vêtements", slug: "mode-vetements" },
    isActive: true,
    isFeatured: false,
    isNew: false,
    rating: 4.6,
    reviewCount: 54,
    createdAt: "2024-01-07T10:00:00Z",
  },
];

// Helper function to format price (assuming price is in centimes/cents)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Get featured products
export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured && p.isActive);
}

// Get new products
export function getNewProducts(): Product[] {
  return products.filter((p) => p.isNew && p.isActive);
}

// Get products by category
export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter(
    (p) => p.category.slug === categorySlug && p.isActive
  );
}

// Get single product by slug
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug && p.isActive);
}

// Calculate discount percentage
export function getDiscountPercentage(
  price: number,
  originalPrice?: number
): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
