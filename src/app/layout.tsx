import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Eburnie | E-Commerce Premium",
    template: "%s | Eburnie",
  },
  description:
    "Découvrez Eburnie, votre destination shopping en ligne pour des produits de qualité. Une expérience d'achat moderne, élégante et intuitive.",
  keywords: ["e-commerce", "shopping", "boutique en ligne", "Eburnie"],
  openGraph: {
    type: "website",
    siteName: "Eburnie",
    locale: "fr_FR",
  },
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
          {children}
        </Providers>
      </body>
    </html>
  );
}
