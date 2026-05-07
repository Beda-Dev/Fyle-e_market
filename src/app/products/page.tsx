import { Header, Footer } from "@/components/layout";
import { ProductsContent } from "./products-content";

export default function ProductsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/20">
        <ProductsContent />
      </main>
      <Footer />
    </>
  );
}
