"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import QRCode from "qrcode";

export function StampCode({ dni }: { dni: string | null }) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const fetchCode = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stamp-code");
      if (response.ok) {
        const json = await response.json();
        setCode(json.code);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCode();

    const intervalId = setInterval(() => {
      const currentSeconds = Math.floor(Date.now() / 1000);
      const remaining = 60 - (currentSeconds % 60);
      setRemainingSeconds(remaining);

      // Si el reloj llego a 60 (es decir, segundo 0 de la nueva ventana), refetch
      if (remaining === 60) {
        void fetchCode();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (dni && code) {
      const payload = JSON.stringify({ dni, code });
      QRCode.toDataURL(
        payload,
        {
          margin: 2,
          width: 250,
          color: {
            dark: "#121212",
            light: "#ffffff",
          },
        },
        (err, url) => {
          if (!err) {
            setQrUrl(url);
          } else {
            console.error("Error generating QR code:", err);
          }
        }
      );
    }
  }, [dni, code]);

  const progressPercentage = ((60 - remainingSeconds) / 60) * 100;

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl glass-card p-6 shadow-lift relative overflow-hidden border border-white/5">
      {loading && !code ? (
        <div className="grid h-48 place-items-center text-gray-400">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center animate-fade-in">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-4">
            Muestra el QR en caja
          </p>

          {/* QR Code Container */}
          <div className="flex flex-col items-center">
            {qrUrl ? (
              <div className="p-3.5 bg-white rounded-2xl border border-brand-accent/20 shadow-[0_8px_30px_rgba(212,175,55,0.1)] transition-transform duration-300 hover:scale-105">
                <img src={qrUrl} alt="Código QR de fidelidad" className="w-40 h-40 object-contain select-none" />
              </div>
            ) : (
              <div className="w-40 h-40 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <RefreshCw className="h-6 w-6 text-gray-500 animate-spin" />
              </div>
            )}
            <p className="mt-3 text-sm font-semibold tracking-wider text-white">
              DNI: {dni || "Sin DNI"}
            </p>
          </div>

          {/* Manual Entry Fallback */}
          <div className="mt-6 w-full pt-5 border-t border-white/5 flex flex-col items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
              Código Manual Alternativo
            </p>
            <div className="flex justify-center gap-2">
              {code?.split("").map((digit, index) => (
                <div
                  key={index}
                  className="grid h-10 w-9 place-items-center rounded-lg bg-white/15 text-lg font-extrabold text-white border border-white/10"
                >
                  {digit}
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 w-full max-w-[240px]">
            <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
              <span>Código temporal</span>
              <span className={`font-mono font-bold ${remainingSeconds <= 5 ? 'text-red-500 animate-pulse' : 'text-brand-accent'}`}>
                {remainingSeconds}s
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  remainingSeconds <= 5 
                    ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' 
                    : 'bg-brand-accent shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
