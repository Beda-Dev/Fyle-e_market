import { prisma } from '@/lib/prisma'
import {
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

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { product: true } } },
    })
    return Response.json({ data: serializeOrder(order) })
  } catch (error) {
    return handleApiError(error)
  }
}
