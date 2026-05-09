import { prisma } from '@/lib/prisma'
import {
  handleApiError,
  parseJson,
  requireAdmin,
} from '@/lib/api-helpers'
import { settingsUpdateSchema } from '@/lib/schemas'

export async function GET() {
  try {
    await requireAdmin()
    const setting = await prisma.setting.findFirst({ orderBy: { createdAt: 'asc' } })
    return Response.json({ data: setting })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin()
    const data = await parseJson(request, settingsUpdateSchema)

    const existing = await prisma.setting.findFirst({ orderBy: { createdAt: 'asc' } })
    const setting = existing
      ? await prisma.setting.update({ where: { id: existing.id }, data })
      : await prisma.setting.create({ data })

    return Response.json({ data: setting })
  } catch (error) {
    return handleApiError(error)
  }
}
