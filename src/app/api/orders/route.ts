import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  ApiError,
  handleApiError,
  parseJson,
  requireUser,
} from '@/lib/api-helpers'
import { orderCreateSchema } from '@/lib/schemas'
import { serializeOrder } from '@/lib/serializers'
import { sendEmail, getOrderConfirmationEmailHtml } from '@/lib/email'

export async function GET() {
  try {
    const user = await requireUser()
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return Response.json({ data: orders.map(serializeOrder) })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const data = await parseJson(request, orderCreateSchema)

    const order = await prisma.$transaction(async (tx) => {
      const productIds = data.items.map((i) => i.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, isActive: true, stock: true, price: true },
      })

      const foundIds = new Set(products.map((p) => p.id))
      const missing = productIds.filter((id) => !foundIds.has(id))
      if (missing.length > 0) {
        throw new ApiError(
          400,
          `${missing.length} produit(s) de votre panier ne sont plus disponibles. Veuillez les retirer pour continuer.`
        )
      }

      const inactive = products.filter((p) => !p.isActive)
      if (inactive.length > 0) {
        const names = inactive.map((p) => `"${p.name}"`).join(', ')
        throw new ApiError(
          400,
          `Les produits suivants ne sont plus disponibles : ${names}. Veuillez les retirer de votre panier.`
        )
      }

      let total = new Prisma.Decimal(0)
      const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = []

      for (const item of data.items) {
        const product = products.find((p) => p.id === item.productId)!
        if (product.stock < item.quantity) {
          throw new ApiError(400, `Stock insuffisant pour "${product.name}"`)
        }
        total = total.plus(product.price.mul(item.quantity))
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
        })

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        })
      }

      // Récupérer les frais de livraison depuis les settings
      const setting = await tx.setting.findFirst({ orderBy: { createdAt: 'asc' } })
      const defaultShippingCost = setting?.shippingCost ? new Prisma.Decimal(setting.shippingCost.toString()) : new Prisma.Decimal(2500)
      const shippingThreshold = new Prisma.Decimal(50000)
      const shippingCost = total.gte(shippingThreshold) ? new Prisma.Decimal(0) : defaultShippingCost
      const finalTotal = total.plus(shippingCost)

      return tx.order.create({
        data: {
          userId: user.id,
          phone: data.phone,
          addressLine: data.addressLine ?? null,
          city: data.city ?? null,
          longitude: data.longitude ?? null,
          latitude: data.latitude ?? null,
          note: data.note ?? null,
          totalAmount: finalTotal,
          shippingCost: shippingCost,
          items: { createMany: { data: orderItemsData } },
        },
        include: { items: { include: { product: true } } },
      })
    })

    // Envoi de l'email de confirmation (non bloquant — un échec d'email ne casse pas la commande)
    try {
      const customer = await prisma.user.findUnique({
        where: { id: user.id },
        select: { email: true, firstName: true },
      })
      if (customer?.email) {
        const totalNumber = Number(order.totalAmount.toString())
        await sendEmail({
          to: customer.email,
          subject: `Confirmation de votre commande #${order.id.slice(-8).toUpperCase()}`,
          html: getOrderConfirmationEmailHtml({
            firstName: customer.firstName,
            orderId: order.id,
            items: order.items.map((it) => ({
              name: it.product.name,
              quantity: it.quantity,
              unitPrice: Number(it.unitPrice.toString()),
            })),
            totalAmount: totalNumber,
            addressLine: order.addressLine,
            city: order.city,
            phone: order.phone,
          }),
        })
      }
    } catch (emailError) {
      console.error('[orders] failed to send confirmation email:', emailError)
    }

    return Response.json({ data: serializeOrder(order) }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
