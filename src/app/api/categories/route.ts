import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-helpers'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    return Response.json({ data: categories })
  } catch (error) {
    return handleApiError(error)
  }
}
