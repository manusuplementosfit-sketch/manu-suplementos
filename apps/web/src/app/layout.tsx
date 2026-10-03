import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { getBranding } from "@/lib/branding-server";
import { themeCss } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const barlow = Barlow_Condensed({ variable: "--font-barlow", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "Manu Suplementos",
  description: "Suplementos com entrega ou retirada. Pague com Pix ou cartão.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const branding = await getBranding();
  return (
    <html lang="pt-BR" className={`${inter.variable} ${barlow.variable} h-full antialiased`}>
      <head>
        <style id="theme">{`:root { ${themeCss(branding)} }`}</style>
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <Providers branding={branding}>{children}</Providers>
      </body>
    </html>
  );
}
