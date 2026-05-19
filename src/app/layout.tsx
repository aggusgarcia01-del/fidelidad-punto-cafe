import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PuntoCafe Rewards",
  description: "Sellos digitales para clientes de PuntoCafe.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PuntoCafe",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F1EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
