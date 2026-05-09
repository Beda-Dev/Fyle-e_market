import type { Order, OrderItem, Product } from '@prisma/client'

type Decimalish = { toString(): string }

const toNumber = (d: Decimalish) => Number(d.toString())

export const serializeProduct = (p: Product & { category?: { id: string; name: string; slug: string } | null }) => ({
  ...p,
  price: toNumber(p.price),
  originalPrice: toNumber(p.originalPrice),
})

export const serializeOrderItem = (i: OrderItem & { product?: Product | null }) => ({
  ...i,
  unitPrice: toNumber(i.unitPrice),
  product: i.product ? serializeProduct(i.product) : undefined,
})

export const serializeOrder = (
  o: Order & { items?: (OrderItem & { product?: Product | null })[] }
) => ({
  ...o,
  totalAmount: toNumber(o.totalAmount),
  items: o.items?.map(serializeOrderItem),
})
