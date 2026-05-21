"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export function StampCode({ dni }: { dni: string | null }) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(60);

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

  const progressPercentage = ((60 - remainingSeconds) / 60) * 100;

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl glass-card p-6 shadow-lift relative overflow-hidden border border-white/5">
      {loading && !code ? (
        <div className="grid h-40 place-items-center text-gray-400">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Muestra esto en caja
          </p>

          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-gray-400">DNI del Cliente</p>
            <p className="mt-1 text-xl font-bold tracking-widest text-white">
              {dni || "Sin DNI"}
            </p>
          </div>

          <div className="mt-6 flex justify-center gap-2 sm:gap-3">
            {code?.split("").map((digit, index) => (
              <div
                key={index}
                className="grid h-14 w-12 sm:h-16 sm:w-14 place-items-center rounded-xl bg-white text-2xl font-bold text-black shadow-[0_4px_20px_rgba(255,255,255,0.1)]"
              >
                {digit}
              </div>
            ))}
          </div>

          <div className="mt-8 w-full max-w-[240px]">
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
