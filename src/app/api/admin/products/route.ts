import { prisma } from '@/lib/prisma'
import {
  ApiError,
  handleApiError,
  parseJson,
  requireAdmin,
} from '@/lib/api-helpers'
import { productCreateSchema } from '@/lib/schemas'
import { serializeProduct } from '@/lib/serializers'

export async function GET() {
  try {
    await requireAdmin()
    const products = await prisma.product.findMany({
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return Response.json({ data: products.map(serializeProduct) })
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
