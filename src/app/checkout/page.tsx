import { Header, Footer } from "@/components/layout";
import { CheckoutContent } from "./checkout-content";

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <CheckoutContent />
      </main>
      <Footer />
    </>
  );
}
