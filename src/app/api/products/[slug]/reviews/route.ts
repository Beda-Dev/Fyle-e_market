import { prisma } from '@/lib/prisma'
import {
  ApiError,
  handleApiError,
  jsonError,
  parseJson,
  requireUser,
} from '@/lib/api-helpers'
import { reviewCreateSchema, reviewListQuerySchema } from '@/lib/schemas'

export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await ctx.params
    const url = new URL(request.url)
    const parsedQuery = reviewListQuerySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
    })
    if (!parsedQuery.success) {
      throw new ApiError(400, 'Paramètres de pagination invalides', parsedQuery.error.flatten())
    }
    const { page, pageSize } = parsedQuery.data

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!product) return jsonError(404, 'Produit introuvable')

    const [total, reviews, aggregate] = await prisma.$transaction([
      prisma.review.count({ where: { productId: product.id } }),
      prisma.review.findMany({
        where: { productId: product.id },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.aggregate({
        where: { productId: product.id },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ])

    return Response.json({
      data: reviews,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        averageRating: aggregate._avg.rating ?? 0,
        totalReviews: aggregate._count.rating,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  request: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireUser()
    const { slug } = await ctx.params
    const data = await parseJson(request, reviewCreateSchema)

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })
    if (!product) return jsonError(404, 'Produit introuvable')

    // Upsert : un seul avis par couple (user, product). Si déjà présent, on le met à jour.
    const review = await prisma.review.upsert({
      where: {
        userId_productId: { userId: user.id, productId: product.id },
      },
      update: {
        rating: data.rating,
        comment: data.comment ?? null,
      },
      create: {
        userId: user.id,
        productId: product.id,
        rating: data.rating,
        comment: data.comment ?? null,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return Response.json({ data: review }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
