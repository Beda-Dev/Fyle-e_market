import { prisma } from '@/lib/prisma'
import {
  ApiError,
  handleApiError,
  jsonError,
  requireUser,
} from '@/lib/api-helpers'

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await ctx.params

    const review = await prisma.review.findUnique({
      where: { id },
      select: { userId: true },
    })
    if (!review) return jsonError(404, 'Avis introuvable')

    if (review.userId !== user.id && user.role !== 'ADMIN') {
      throw new ApiError(403, 'Action non autorisée')
    }

    await prisma.review.delete({ where: { id } })
    return Response.json({ data: { id } })
  } catch (error) {
    return handleApiError(error)
  }
}
