import { Header, Footer } from "@/components/layout";
import {
  HeroSection,
  CategoriesSection,
  FeaturedProductsSection,
  PromoBannerSection,
  NewArrivalsSection,
  TestimonialsSection,
} from "@/components/home";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <FeaturedProductsSection />
        <PromoBannerSection />
        <NewArrivalsSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
}
