import { prisma } from '@/lib/prisma'
import { handleApiError, jsonError } from '@/lib/api-helpers'
import { serializeProduct } from '@/lib/serializers'

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/products/[slug]'>
) {
  try {
    const { slug } = await ctx.params
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })
    if (!product || !product.isActive) {
      return jsonError(404, 'Produit introuvable')
    }
    return Response.json({ data: serializeProduct(product) })
  } catch (error) {
    return handleApiError(error)
  }
}
