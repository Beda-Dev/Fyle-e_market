import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Header, Footer } from "@/components/layout";
import { ProfileContent } from "./profile-content";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <ProfileContent userId={session.user.id} />
      </main>
      <Footer />
    </>
  );
}
