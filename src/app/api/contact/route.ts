import { handleApiError } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { sendEmail, getContactEmailHtml } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return Response.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    // Récupérer l'email destinataire depuis les settings, sinon fallback sur EMAIL env
    const settings = await prisma.setting.findFirst();
    const recipientEmail = settings?.email || process.env.EMAIL;

    if (!recipientEmail) {
      return Response.json({ error: "Aucune adresse email de réception configurée" }, { status: 500 });
    }

    await sendEmail({
      to: recipientEmail,
      subject: `[Contact Eburnie] ${subject}`,
      html: getContactEmailHtml(name, email, subject, message),
    });

    return Response.json({ success: true, message: "Message envoyé avec succès" });
  } catch (error) {
    return handleApiError(error);
  }
}
