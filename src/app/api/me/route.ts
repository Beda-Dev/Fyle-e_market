import { prisma } from '@/lib/prisma'
import {
  handleApiError,
  jsonError,
  parseJson,
  requireUser,
} from '@/lib/api-helpers'
import { updateProfileSchema } from '@/lib/schemas'

const userPublicSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  createdAt: true,
} as const

export async function GET() {
  try {
    const user = await requireUser()
    const data = await prisma.user.findUnique({
      where: { id: user.id },
      select: userPublicSelect,
    })
    if (!data) return jsonError(404, 'Utilisateur introuvable')
    return Response.json({ data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser()
    const body = await parseJson(request, updateProfileSchema)

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: body,
      select: userPublicSelect,
    })
    return Response.json({ data: updated })
  } catch (error) {
    return handleApiError(error)
  }
}
