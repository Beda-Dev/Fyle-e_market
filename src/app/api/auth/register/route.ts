import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { handleApiError, jsonError, parseJson } from '@/lib/api-helpers'
import { rateLimit } from '@/lib/rate-limit'
import { registerSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  try {
    rateLimit(request, { key: 'register', limit: 5, windowMs: 60 * 60 * 1000 })
    const data = await parseJson(request, registerSchema)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return jsonError(409, 'Un compte avec cet email existe déjà')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? null,
        role: 'CLIENT',
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    })

    return Response.json({ message: 'Compte créé avec succès', user }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
