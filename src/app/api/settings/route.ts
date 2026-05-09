import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-helpers'

export async function GET() {
  try {
    const setting = await prisma.setting.findFirst({ orderBy: { createdAt: 'asc' } })
    return Response.json({ data: setting })
  } catch (error) {
    return handleApiError(error)
  }
}
