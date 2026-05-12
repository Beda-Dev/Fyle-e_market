import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  ApiError,
  handleApiError,
  jsonError,
  parseJson,
  requireAdmin,
} from '@/lib/api-helpers'
import { adminUserUpdateSchema } from '@/lib/schemas'

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params
    const { role } = await parseJson(request, adminUserUpdateSchema)

    if (id === admin.id) {
      throw new ApiError(400, 'Vous ne pouvez pas changer votre propre rôle')
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    })
    if (!user) return jsonError(404, 'Utilisateur introuvable')

    // Refuser de dégrader le dernier admin pour éviter de se retrouver sans admin
    if (user.role === 'ADMIN' && role === 'CLIENT') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
      if (adminCount <= 1) {
        throw new ApiError(
          400,
          "Impossible : c'est le dernier administrateur du site"
        )
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    })

    return Response.json({ data: updated })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await ctx.params

    if (id === admin.id) {
      throw new ApiError(400, 'Vous ne pouvez pas supprimer votre propre compte')
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, _count: { select: { orders: true } } },
    })
    if (!user) return jsonError(404, 'Utilisateur introuvable')

    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
      if (adminCount <= 1) {
        throw new ApiError(
          400,
          "Impossible : c'est le dernier administrateur du site"
        )
      }
    }

    if (user._count.orders > 0) {
      throw new ApiError(
        409,
        `Impossible : cet utilisateur a ${user._count.orders} commande(s). Pour préserver l'historique, le compte ne peut pas être supprimé.`
      )
    }

    try {
      await prisma.user.delete({ where: { id } })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ApiError(
          409,
          'Impossible : cet utilisateur est référencé ailleurs (commandes, avis…)'
        )
      }
      throw error
    }

    return Response.json({ data: { id, deleted: true } })
  } catch (error) {
    return handleApiError(error)
  }
}
