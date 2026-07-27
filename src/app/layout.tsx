import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Playfair_Display, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "Desserty House | Freshly Baked Happiness",
  description: "Artisanal treats made fresh daily. Order directly via WhatsApp or Email!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${playfair.variable} font-sans bg-background text-chocolate antialiased`}>
        {children}
      </body>
    </html>
  );
}
