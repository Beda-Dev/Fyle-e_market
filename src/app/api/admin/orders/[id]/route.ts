import { prisma } from '@/lib/prisma'
import {
  ApiError,
  handleApiError,
  jsonError,
  parseJson,
  requireAdmin,
} from '@/lib/api-helpers'
import { orderStatusUpdateSchema } from '@/lib/schemas'
import { serializeOrder } from '@/lib/serializers'

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/admin/orders/[id]'>
) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      },
    })
    if (!order) return jsonError(404, 'Commande introuvable')
    return Response.json({ data: serializeOrder(order) })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<'/api/admin/orders/[id]'>
) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const { status } = await parseJson(request, orderStatusUpdateSchema)

    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      })
      if (!current) {
        throw new ApiError(404, 'Commande introuvable')
      }

      // Si la commande passe de non-annulée à CANCELLED, restituer le stock
      if (status === 'CANCELLED' && current.status !== 'CANCELLED') {
        for (const item of current.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }

      // Si une commande annulée est ré-ouverte, re-décrémenter le stock (avec contrôle)
      if (status !== 'CANCELLED' && current.status === 'CANCELLED') {
        for (const item of current.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true, name: true },
          })
          if (!product || product.stock < item.quantity) {
            throw new ApiError(
              400,
              `Stock insuffisant pour rouvrir la commande (produit "${product?.name ?? item.productId}")`
            )
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }

      return tx.order.update({
        where: { id },
        data: { status },
        include: { items: { include: { product: true } } },
      })
    })

    return Response.json({ data: serializeOrder(order) })
  } catch (error) {
    return handleApiError(error)
  }
}
