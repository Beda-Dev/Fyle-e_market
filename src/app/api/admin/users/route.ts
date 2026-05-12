import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  ApiError,
  handleApiError,
  requireAdmin,
} from '@/lib/api-helpers'
import { adminUserListQuerySchema } from '@/lib/schemas'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const url = new URL(request.url)
    const parsed = adminUserListQuerySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      role: url.searchParams.get('role') ?? undefined,
    })
    if (!parsed.success) {
      throw new ApiError(400, 'Paramètres invalides', parsed.error.flatten())
    }
    const { page, pageSize, search, role } = parsed.data

    const where: Prisma.UserWhereInput = {}
    if (role) where.role = role
    if (search) {
      const trimmed = search.trim()
      if (trimmed) {
        where.OR = [
          { email: { contains: trimmed } },
          { firstName: { contains: trimmed } },
          { lastName: { contains: trimmed } },
        ]
      }
    }

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return Response.json({
      data: users,
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
