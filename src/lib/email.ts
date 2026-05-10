import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APPLICATION_PASSWORD,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  await transporter.sendMail({
    from: `"Eburnie" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  })
}

export function getContactEmailHtml(name: string, email: string, subject: string, message: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #73442A; margin: 0;">Eburnie</h1>
        <p style="color: #888; font-size: 14px;">Nouveau message de contact</p>
      </div>
      <div style="background: #f9f9f9; border-radius: 8px; padding: 30px;">
        <h2 style="color: #333; margin-top: 0;">${subject}</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; color: #888; width: 80px;">Nom :</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Email :</td>
            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #F97316;">${email}</a></td>
          </tr>
        </table>
        <div style="border-top: 1px solid #ddd; padding-top: 16px;">
          <p style="color: #555; white-space: pre-wrap;">${message}</p>
        </div>
      </div>
      <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 20px;">
        Ce message a été envoyé depuis le formulaire de contact du site Eburnie.
      </p>
    </div>
  `
}

export function getResetPasswordEmailHtml(resetUrl: string, firstName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #73442A; margin: 0;">Eburnie</h1>
      </div>
      <div style="background: #f9f9f9; border-radius: 8px; padding: 30px;">
        <h2 style="color: #333; margin-top: 0;">Réinitialisation de mot de passe</h2>
        <p style="color: #555;">Bonjour ${firstName},</p>
        <p style="color: #555;">
          Vous avez demandé la réinitialisation de votre mot de passe. 
          Cliquez sur le bouton ci-dessous pour en choisir un nouveau :
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #F97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">
          Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
        </p>
      </div>
      <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 20px;">
        © ${new Date().getFullYear()} Eburnie. Tous droits réservés.
      </p>
    </div>
  `
}
