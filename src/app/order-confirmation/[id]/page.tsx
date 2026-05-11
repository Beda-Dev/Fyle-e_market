import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header, Footer } from "@/components/layout";
import { OrderConfirmationContent } from "./order-confirmation-content";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Commande introuvable</h1>
          <p className="text-muted-foreground">La commande demandée n'existe pas.</p>
        </div>
      </div>
    );
  }

  if (order.userId !== session.user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
          <p className="text-muted-foreground">Vous n'avez pas accès à cette commande.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <OrderConfirmationContent order={order} />
      </main>
      <Footer />
    </>
  );
}
