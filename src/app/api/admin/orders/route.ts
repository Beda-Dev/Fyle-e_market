import { prisma } from '@/lib/prisma'
import { handleApiError, requireAdmin } from '@/lib/api-helpers'
import { orderStatusSchema } from '@/lib/schemas'
import { serializeOrder } from '@/lib/serializers'
import type { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const url = new URL(request.url)
    const statusParam = url.searchParams.get('status')

    const where: Prisma.OrderWhereInput = {}
    if (statusParam) {
      const parsed = orderStatusSchema.safeParse(statusParam)
      if (parsed.success) where.status = parsed.data
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return Response.json({ data: orders.map(serializeOrder) })
  } catch (error) {
    return handleApiError(error)
  }
}
