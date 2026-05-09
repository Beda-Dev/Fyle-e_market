import { handleApiError } from "@/lib/api-helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return Response.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    // TODO: Implémenter l'envoi d'email réel
    // Pour l'instant, on simule l'envoi
    console.log("Contact form submission:", { name, email, subject, message });

    return Response.json({ success: true, message: "Message envoyé avec succès" });
  } catch (error) {
    return handleApiError(error);
  }
}
