import { prisma } from '@/lib/prisma'
import {
  ApiError,
  handleApiError,
  jsonError,
  parseJson,
  requireAdmin,
} from '@/lib/api-helpers'
import { categoryUpdateSchema } from '@/lib/schemas'

export async function PUT(
  request: Request,
  ctx: RouteContext<'/api/admin/categories/[id]'>
) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const data = await parseJson(request, categoryUpdateSchema)

    if (data.slug || data.name) {
      const conflict = await prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(data.slug ? [{ slug: data.slug }] : []),
                ...(data.name ? [{ name: data.name }] : []),
              ],
            },
          ],
        },
      })
      if (conflict) throw new ApiError(409, 'Nom ou slug déjà utilisé')
    }

    const category = await prisma.category.update({ where: { id }, data })
    return Response.json({ data: category })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<'/api/admin/categories/[id]'>
) {
  try {
    await requireAdmin()
    const { id } = await ctx.params

    const productCount = await prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return jsonError(409, 'Impossible de supprimer : des produits sont liés à cette catégorie')
    }

    await prisma.category.delete({ where: { id } })
    return Response.json({ data: { id, deleted: true } })
  } catch (error) {
    return handleApiError(error)
  }
}
