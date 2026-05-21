"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";

export function QRScanner({ onScan, onClose }: { onScan: (token: string) => void; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) {
              onScan(decodedText);
            }
          },
          (errorMessage) => {
            // Ignore scan failures (usually just means no QR in view)
          }
        );
      } catch (err) {
        if (isMounted) {
          setError("Error al acceder a la cámara. Revisa los permisos.");
        }
      }
    };

    // Initialize scanner
    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#121212] p-6 text-center shadow-2xl animate-scale-in flex flex-col">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10 bg-black/50 p-2 rounded-full"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white">Escanear Código QR</h3>
          <p className="text-xs text-gray-400">Enfoca el código QR de la app del cliente.</p>
        </div>

        {error ? (
          <div className="p-8 text-center aspect-square flex items-center justify-center bg-white/5 rounded-2xl">
            <p className="text-error font-medium">{error}</p>
          </div>
        ) : (
          /* Camera Viewport */
          <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden border border-white/5 shadow-inner">
            <div id="qr-reader" className="w-full h-full object-cover [&_video]:object-cover" />
            {/* Overlay lines/focus indicator */}
            <div className="absolute inset-8 border-2 border-brand-accent/30 rounded-2xl pointer-events-none animate-pulse flex items-center justify-center z-10">
              <div className="w-full h-[1px] bg-brand-accent/50" />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full h-11 text-xs font-bold border border-white/10 hover:bg-white/5 rounded-xl transition-colors text-white"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
