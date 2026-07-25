import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/providers/SessionProvider";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ComingSoonOverlay } from "@/components/ComingSoonOverlay";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Nar-ı Has",
    default: "Nar-ı Has — Geleneksel Anadolu Mutfağı",
  },
  description:
    "Nar-ı Has'ta geleneksel Anadolu mutfağının en seçkin tatlarını online sipariş edin. Kapıda nakit veya kart ile ödeme.",
  keywords: ["Nar-ı Has", "yemek siparişi", "Anadolu mutfağı", "online sipariş", "kebap", "pide"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-gray-50 antialiased">
        <ComingSoonOverlay />
        <SessionProvider>
          <CartProvider>
            <Navbar />
            <CartDrawer />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
