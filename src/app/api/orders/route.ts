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
        where: { id: { in: productIds }, isActive: true },
      })

      if (products.length !== productIds.length) {
        throw new ApiError(400, 'Un ou plusieurs produits sont introuvables ou inactifs')
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

      return tx.order.create({
        data: {
          userId: user.id,
          phone: data.phone,
          addressLine: data.addressLine ?? null,
          city: data.city ?? null,
          longitude: data.longitude ?? null,
          latitude: data.latitude ?? null,
          note: data.note ?? null,
          totalAmount: total,
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
