import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { CartProvider } from "@/components/cart-context";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const barlow = Barlow_Condensed({ variable: "--font-barlow", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "Manu Suplementos",
  description: "Suplementos com entrega ou retirada. Pague com Pix ou cartão.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${barlow.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
