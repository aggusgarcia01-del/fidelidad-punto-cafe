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
    <div className="mx-auto w-full max-w-sm rounded-xl bg-surface-variant/10 border border-surface-variant/10 p-6 shadow-lift relative overflow-hidden">
      {loading && !code ? (
        <div className="grid h-40 place-items-center text-surface-variant/60">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary-fixed-dim">
            Muestra esto en caja
          </p>

          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-surface-variant/60">DNI del Cliente</p>
            <p className="mt-1 text-xl font-bold tracking-widest text-inverse-on-surface">
              {dni || "Sin DNI"}
            </p>
          </div>

          <div className="mt-6 flex justify-center gap-2 sm:gap-3">
            {code?.split("").map((digit, index) => (
              <div
                key={index}
                className="grid h-14 w-12 sm:h-16 sm:w-14 place-items-center rounded-lg bg-inverse-on-surface text-2xl font-bold text-primary-container shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
              >
                {digit}
              </div>
            ))}
          </div>

          <div className="mt-8 w-full max-w-[240px]">
            <div className="flex justify-between text-xs font-medium text-surface-variant/60 mb-2">
              <span>Código temporal</span>
              <span className="font-mono">{remainingSeconds}s</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant/10">
              <div
                className="h-full bg-secondary-fixed-dim transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
