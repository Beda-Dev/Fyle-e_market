import { Header, Footer } from "@/components/layout";
import { CartContent } from "./cart-content";

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <CartContent />
      </main>
      <Footer />
    </>
  );
}
