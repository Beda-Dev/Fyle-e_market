import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/lib/prisma'
import {
  ApiError,
  handleApiError,
  jsonError,
  parseJson,
  requireAdmin,
} from '@/lib/api-helpers'
import { productUpdateSchema } from '@/lib/schemas'
import { serializeProduct } from '@/lib/serializers'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/admin/products/[id]'>
) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })
    if (!product) return jsonError(404, 'Produit introuvable')
    return Response.json({ data: serializeProduct(product) })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: Request,
  ctx: RouteContext<'/api/admin/products/[id]'>
) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const data = await parseJson(request, productUpdateSchema)

    if (data.slug) {
      const conflict = await prisma.product.findUnique({ where: { slug: data.slug } })
      if (conflict && conflict.id !== id) {
        throw new ApiError(409, 'Ce slug est déjà utilisé')
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true, slug: true } } },
    })
    return Response.json({ data: serializeProduct(product) })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<'/api/admin/products/[id]'>
) {
  try {
    await requireAdmin()
    const { id } = await ctx.params

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return jsonError(404, 'Produit introuvable')

    const hasOrders = await prisma.orderItem.count({ where: { productId: id } })
    if (hasOrders > 0) {
      await prisma.product.update({ where: { id }, data: { isActive: false } })
      return Response.json({ data: { id, deactivated: true } })
    }

    await prisma.product.delete({ where: { id } })

    if (product.imagePublicId) {
      cloudinary.uploader.destroy(product.imagePublicId).catch(() => {})
    }

    return Response.json({ data: { id, deleted: true } })
  } catch (error) {
    return handleApiError(error)
  }
}
