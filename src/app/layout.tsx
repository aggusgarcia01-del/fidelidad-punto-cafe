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
      <body className={`${plusJakarta.variable} ${hankenGrotesk.variable} font-sans bg-primary-container min-h-screen text-inverse-on-surface antialiased selection:bg-secondary-fixed-dim selection:text-primary-container relative overflow-x-hidden`}>
        {/* Premium Gradient Background */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#131110]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(181,164,140,0.15),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(60,45,35,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#131110_80%)]"></div>
        </div>
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
          <PwaRegister />
        </div>
      </body>
    </html>
  );
}
