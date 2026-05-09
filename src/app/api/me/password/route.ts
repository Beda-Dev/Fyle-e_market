import { prisma } from '@/lib/prisma'
import { handleApiError, requireUser } from '@/lib/api-helpers'
import bcrypt from 'bcryptjs'

export async function PATCH(request: Request) {
  try {
    const user = await requireUser()
    const body = await request.json()

    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return Response.json({ error: 'Mot de passe requis' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return Response.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 })
    }

    // Vérifier le mot de passe actuel
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    })

    if (!currentUser) {
      return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password)

    if (!isPasswordValid) {
      return Response.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return Response.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
