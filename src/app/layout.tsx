import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Hanken_Grotesk } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Punto Café - Membresía de Autor",
  description: "Sellos digitales para clientes de Punto Café.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Punto Café",
  },
};

export const viewport: Viewport = {
  themeColor: "#131110",
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
    <html lang="es" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${plusJakarta.variable} ${hankenGrotesk.variable} font-sans antialiased bg-primary-container text-inverse-on-surface selection:bg-secondary-fixed-dim selection:text-primary-container`}>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
