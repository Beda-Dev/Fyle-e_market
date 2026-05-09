import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AnimatePresence } from "framer-motion";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Eburnie | E-Commerce Premium",
  description:
    "Découvrez Eburnie, votre destination shopping en ligne pour des produits de qualité. Une expérience d'achat moderne, élégante et intuitive.",
  keywords: ["e-commerce", "shopping", "boutique en ligne", "Eburnie"],
};

export const viewport: Viewport = {
  themeColor: "var(--color-brand-orange)",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${poppins.variable} h-full antialiased bg-background`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </Providers>
      </body>
    </html>
  );
}
