"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

export function QRScanner({ onScan, onClose }: { onScan: (token: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let scanInterval: NodeJS.Timeout;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        let isScanning = true;

        const scanFrame = () => {
          if (!isScanning) return;

          const video = videoRef.current;
          const canvas = canvasRef.current;
          
          if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (ctx) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, canvas.width, canvas.height, {
                inversionAttempts: "attemptBoth",
              });

              if (code && code.data) {
                isScanning = false;
                onScan(code.data);
                return;
              }
            }
          }
          
          // Use setTimeout instead of requestAnimationFrame to avoid maxing out CPU
          scanInterval = setTimeout(scanFrame, 250);
        };

        // Start scanning loop
        scanFrame();
      } catch (err) {
        setError("No se pudo acceder a la cámara. Revisa los permisos.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      clearTimeout(scanInterval);
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
          <h3 className="text-white font-bold tracking-widest text-sm uppercase">Escáner QR</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white p-2">
            ✕
          </button>
        </div>

        {error ? (
          <div className="p-8 text-center aspect-square flex items-center justify-center">
            <p className="text-error font-medium">{error}</p>
          </div>
        ) : (
          <div className="relative aspect-square w-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              {...({ "webkit-playsinline": "true" } as any)}
            />
            {/* Overlay target */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[70%] h-[70%] border-2 border-brand-accent/50 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
