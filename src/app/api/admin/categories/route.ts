import { prisma } from '@/lib/prisma'
import {
  ApiError,
  handleApiError,
  parseJson,
  requireAdmin,
} from '@/lib/api-helpers'
import { categoryCreateSchema } from '@/lib/schemas'

export async function GET() {
  try {
    await requireAdmin()
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    return Response.json({ data: categories })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const data = await parseJson(request, categoryCreateSchema)

    const conflict = await prisma.category.findFirst({
      where: { OR: [{ slug: data.slug }, { name: data.name }] },
    })
    if (conflict) throw new ApiError(409, 'Nom ou slug déjà utilisé')

    const category = await prisma.category.create({ data })
    return Response.json({ data: category }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
