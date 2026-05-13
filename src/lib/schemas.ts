import { z } from 'zod'

export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug invalide (minuscules, chiffres, tirets)')

export const cuidSchema = z.string().min(1)

export const registerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email().max(120),
  password: z.string().min(6).max(100),
  phone: z.string().max(30).optional().nullable(),
})

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(30).nullable().optional(),
})

export const productCreateSchema = z.object({
  name: z.string().min(1).max(150),
  slug: slugSchema,
  description: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().positive(),
  stock: z.number().int().min(0),
  imageUrl: z.string().min(1),
  imagePublicId: z.string().min(1),
  isActive: z.boolean().optional(),
  categoryId: cuidSchema,
})

export const productUpdateSchema = productCreateSchema.partial()

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(80),
  slug: slugSchema,
  description: z.string().max(500).nullable().optional(),
  image: z.string().max(500).nullable().optional(),
  imagePublicId: z.string().max(200).nullable().optional(),
})

export const categoryUpdateSchema = categoryCreateSchema.partial()

export const productListQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  isActive: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
})

export const orderItemInputSchema = z.object({
  productId: cuidSchema,
  quantity: z.number().int().positive(),
})

export const orderCreateSchema = z.object({
  items: z.array(orderItemInputSchema).min(1),
  phone: z.string().min(1).max(30),
  addressLine: z.string().max(200).nullable().optional(),
  city: z.string().max(80).nullable().optional(),
  longitude: z.number().nullable().optional(),
  latitude: z.number().nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
})

export const orderStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
])

export const orderStatusUpdateSchema = z.object({
  status: orderStatusSchema,
})

export const orderBulkStatusUpdateSchema = z.object({
  ids: z.array(cuidSchema).min(1).max(100),
  status: orderStatusSchema,
})

export const reviewCreateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).nullable().optional(),
})

export const reviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
})

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  role: z.enum(['ADMIN', 'CLIENT']).optional(),
})

export const adminUserUpdateSchema = z.object({
  role: z.enum(['ADMIN', 'CLIENT']),
})

export const settingsUpdateSchema = z.object({
  customerService: z.string().min(1).max(80),
  email: z.string().email().max(120).nullable().optional(),
  whatsapp: z.string().max(30).nullable().optional(),
  slogan: z.string().min(1),
  location: z.string().max(200).nullable().optional(),
  shippingCost: z.number().positive().nullable().optional(),
})
