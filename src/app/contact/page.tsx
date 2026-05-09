import { Header, Footer } from "@/components/layout";
import { prisma } from "@/lib/prisma";
import { ContactContent } from "./contact-content";

export default async function ContactPage() {
  const settings = await prisma.setting.findFirst();

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <ContactContent settings={settings} />
      </main>
      <Footer />
    </>
  );
}
