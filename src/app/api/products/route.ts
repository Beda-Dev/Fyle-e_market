import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-helpers'
import { productListQuerySchema } from '@/lib/schemas'
import { serializeProduct } from '@/lib/serializers'
import type { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const parsed = productListQuerySchema.parse(Object.fromEntries(url.searchParams))

    const where: Prisma.ProductWhereInput = {
      isActive: parsed.isActive ?? true,
      ...(parsed.category && { category: { slug: parsed.category } }),
      ...(parsed.search && {
        OR: [
          { name: { contains: parsed.search } },
          { description: { contains: parsed.search } },
        ],
      }),
    }

    const [total, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (parsed.page - 1) * parsed.pageSize,
        take: parsed.pageSize,
      }),
    ])

    return Response.json({
      data: products.map(serializeProduct),
      pagination: {
        page: parsed.page,
        pageSize: parsed.pageSize,
        total,
        totalPages: Math.ceil(total / parsed.pageSize),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
