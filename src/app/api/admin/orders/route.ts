import { prisma } from '@/lib/prisma'
import { ApiError, handleApiError, requireAdmin } from '@/lib/api-helpers'
import { adminListQuerySchema, orderStatusSchema } from '@/lib/schemas'
import { serializeOrder } from '@/lib/serializers'
import type { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const url = new URL(request.url)
    const statusParam = url.searchParams.get('status')

    const parsedPagination = adminListQuerySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
    })
    if (!parsedPagination.success) {
      throw new ApiError(400, 'Paramètres invalides', parsedPagination.error.flatten())
    }
    const { page, pageSize } = parsedPagination.data

    const where: Prisma.OrderWhereInput = {}
    if (statusParam) {
      const parsed = orderStatusSchema.safeParse(statusParam)
      if (parsed.success) where.status = parsed.data
    }

    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: true } },
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return Response.json({
      data: orders.map(serializeOrder),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
