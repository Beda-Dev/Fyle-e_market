import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header, Footer } from "@/components/layout";
import { OrdersContent } from "./orders-content";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const orderInclude = {
  items: { include: { product: true } },
} satisfies Prisma.OrderInclude;

type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function OrdersLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-8 w-64 bg-muted rounded mb-8"></div>
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-6 space-y-4">
            <div className="h-6 w-48 bg-muted rounded"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
            <div className="h-4 w-24 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  let orders: OrderWithItems[] = [];
  try {
    orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[orders] failed to load orders:", error);
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <Suspense fallback={<OrdersLoadingSkeleton />}>
          <OrdersContent orders={orders} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
