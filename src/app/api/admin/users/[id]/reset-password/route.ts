import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import {
  handleApiError,
  jsonError,
  requireAdmin,
} from '@/lib/api-helpers'
import { sendEmail, getResetPasswordEmailHtml } from '@/lib/email'

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await ctx.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true },
    })
    if (!user) return jsonError(404, 'Utilisateur introuvable')

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600 * 1000) // 1h

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    })

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    try {
      await sendEmail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe - Eburnie',
        html: getResetPasswordEmailHtml(resetUrl, user.firstName),
      })
    } catch (emailError) {
      console.error('[admin/reset-password] email failed:', emailError)
      return jsonError(
        500,
        'Le token a été généré mais l\'envoi de l\'email a échoué. Renvoyez la demande ou contactez le client manuellement.'
      )
    }

    return Response.json({
      data: { sent: true, email: user.email },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
