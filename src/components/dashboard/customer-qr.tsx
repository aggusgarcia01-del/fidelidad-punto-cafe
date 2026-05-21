"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function CustomerQR({ dni }: { dni: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [shortCode, setShortCode] = useState<string>("");
  const [expiresIn, setExpiresIn] = useState<number>(300); // 5 minutes default
  const [loading, setLoading] = useState(true);

  const refreshToken = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customer/qr-token");
      const data = await res.json();
      
      if (data.token) {
        setExpiresIn(300);
        // Usar el código de 4 dígitos generado por el backend
        setShortCode(data.code || data.token.slice(-4).toUpperCase());
        
        // Generar la imagen del QR
        const url = await QRCode.toDataURL(data.token, {
          width: 200,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        setQrDataUrl(url);
      }
    } catch (error) {
      console.error("Error generating QR", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshToken();
  }, []);

  // Timer para expiración visual
  useEffect(() => {
    if (expiresIn <= 0) {
      refreshToken(); // autorenew
      return;
    }
    const timer = setTimeout(() => setExpiresIn((e) => e - 1), 1000);
    return () => clearTimeout(timer);
  }, [expiresIn]);

  const minutes = Math.floor(expiresIn / 60);
  const seconds = expiresIn % 60;
  const isExpiringSoon = expiresIn < 60;

  if (loading && !qrDataUrl) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-6">
        <div className="w-[200px] h-[200px] bg-white/5 rounded-xl animate-pulse mb-4"></div>
        <div className="w-24 h-4 bg-white/10 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-2xl max-w-xs mx-auto shadow-xl">
      {qrDataUrl && (
        <img 
          src={qrDataUrl} 
          alt="Código QR" 
          width={200} 
          height={200} 
          className="rounded-lg mb-4"
        />
      )}
      
      <div className="w-full bg-surface-container-low p-3 rounded-xl text-center mb-3">
        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1">
          Código Manual
        </span>
        <span className="text-2xl font-black text-on-surface tracking-widest">
          {shortCode}
        </span>
      </div>

      <div className="w-full flex justify-between items-center text-xs font-medium px-1">
        <span className="text-on-surface-variant">DNI: {dni}</span>
        <span className={`${isExpiringSoon ? "text-error" : "text-green-600"} font-bold`}>
          {isExpiringSoon ? "Renovando en " : "Válido "}
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
