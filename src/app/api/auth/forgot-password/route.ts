import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendEmail, getResetPasswordEmailHtml } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "L'email est requis" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // On retourne toujours un succès pour ne pas révéler si l'email existe
    if (!user) {
      return NextResponse.json({
        message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
      })
    }

    // Générer un token unique
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 heure

    // Sauvegarder le token en BDD
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    })

    // Construire l'URL de réinitialisation
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    // Envoyer l'email
    await sendEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe - Eburnie",
      html: getResetPasswordEmailHtml(resetUrl, user.firstName),
    })

    return NextResponse.json({
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    )
  }
}
