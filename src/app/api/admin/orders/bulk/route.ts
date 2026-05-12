import { prisma } from '@/lib/prisma'
import {
  ApiError,
  handleApiError,
  parseJson,
  requireAdmin,
} from '@/lib/api-helpers'
import { orderBulkStatusUpdateSchema } from '@/lib/schemas'

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const { ids, status } = await parseJson(request, orderBulkStatusUpdateSchema)

    // Une seule transaction : si l'une des opérations échoue (ex. stock insuffisant
    // lors de la réouverture d'une commande annulée), tout est rollback — c'est plus
    // prévisible que de laisser un état partiel en base.
    const result = await prisma.$transaction(async (tx) => {
      const orders = await tx.order.findMany({
        where: { id: { in: ids } },
        include: { items: true },
      })

      if (orders.length === 0) {
        throw new ApiError(404, 'Aucune commande trouvée')
      }

      let updated = 0
      let skipped = 0

      for (const current of orders) {
        if (current.status === status) {
          skipped += 1
          continue
        }

        // Annulation : restituer le stock
        if (status === 'CANCELLED' && current.status !== 'CANCELLED') {
          for (const item of current.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            })
          }
        }

        // Réouverture : re-décrémenter avec contrôle
        if (status !== 'CANCELLED' && current.status === 'CANCELLED') {
          for (const item of current.items) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { stock: true, name: true },
            })
            if (!product || product.stock < item.quantity) {
              throw new ApiError(
                400,
                `Stock insuffisant pour rouvrir la commande #${current.id.slice(-8).toUpperCase()} (produit "${product?.name ?? item.productId}")`
              )
            }
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            })
          }
        }

        await tx.order.update({
          where: { id: current.id },
          data: { status },
        })
        updated += 1
      }

      return { updated, skipped, requested: ids.length }
    })

    return Response.json({ data: result })
  } catch (error) {
    return handleApiError(error)
  }
}
