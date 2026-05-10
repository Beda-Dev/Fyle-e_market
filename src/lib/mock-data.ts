// helpers + types partages entre front et back
// les donnees viennent maintenant de Prisma (cf prisma/seed.ts pour le contenu)

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  productCount?: number
  createdAt?: string | Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice: number
  stock: number
  imageUrl: string
  imagePublicId?: string
  images: string[]
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  categoryId: string
  category: Pick<Category, 'id' | 'name' | 'slug'>
  createdAt: string | Date
  updatedAt?: string | Date
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  totalAmount: number
  addressLine: string | null
  city: string | null
  phone: string
  note: string | null
  items: {
    id?: string
    product?: Product
    productId?: string
    quantity: number
    unitPrice: number
  }[]
  createdAt: string | Date
}

// Format CFA
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function getDiscountPercentage(
  price: number,
  originalPrice?: number,
): number | null {
  if (!originalPrice || originalPrice <= price) return null
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

// Formate un nombre pour affichage dans un input (ex: "1 000 000")
export function formatPriceInput(value: string): string {
  // On ne garde que les chiffres
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  // On formate avec des espaces comme séparateur de milliers
  return Number(digits).toLocaleString('fr-FR')
}

// Parse un prix formaté en nombre (ex: "1 000 000" → 1000000)
export function parsePriceInput(value: string): number {
  return Number(value.replace(/\s/g, '').replace(/\D/g, '')) || 0
}
