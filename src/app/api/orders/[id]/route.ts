import { prisma } from '@/lib/prisma'
import { handleApiError, jsonError, requireUser } from '@/lib/api-helpers'
import { serializeOrder } from '@/lib/serializers'

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/orders/[id]'>
) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    })

    if (!order || order.userId !== user.id) {
      return jsonError(404, 'Commande introuvable')
    }
    return Response.json({ data: serializeOrder(order) })
  } catch (error) {
    return handleApiError(error)
  }
}
