import { prisma } from '@/lib/prisma'
import {
  ApiError,
  handleApiError,
  parseJson,
  requireAdmin,
} from '@/lib/api-helpers'
import { adminListQuerySchema, productCreateSchema } from '@/lib/schemas'
import { serializeProduct } from '@/lib/serializers'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    const url = new URL(request.url)
    const parsed = adminListQuerySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
    })
    if (!parsed.success) {
      throw new ApiError(400, 'Paramètres invalides', parsed.error.flatten())
    }
    const { page, pageSize } = parsed.data

    const [total, products] = await prisma.$transaction([
      prisma.product.count(),
      prisma.product.findMany({
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return Response.json({
      data: products.map(serializeProduct),
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

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const data = await parseJson(request, productCreateSchema)

    const slugTaken = await prisma.product.findUnique({ where: { slug: data.slug } })
    if (slugTaken) throw new ApiError(409, 'Ce slug est déjà utilisé')

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        stock: data.stock,
        imageUrl: data.imageUrl,
        imagePublicId: data.imagePublicId,
        isActive: data.isActive ?? true,
        categoryId: data.categoryId,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })
    return Response.json({ data: serializeProduct(product) }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
