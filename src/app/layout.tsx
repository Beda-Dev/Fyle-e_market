import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

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
  title: "FYLE MARKET | E-Commerce Premium",
  description:
    "Découvrez FYLE MARKET, votre destination shopping en ligne pour des produits de qualité. Une expérience d'achat moderne, élégante et intuitive.",
  keywords: ["e-commerce", "shopping", "boutique en ligne", "FYLE MARKET"],
};

export const viewport: Viewport = {
  themeColor: "#F07C1E",
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
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
