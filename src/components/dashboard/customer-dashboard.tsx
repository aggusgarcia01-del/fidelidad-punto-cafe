"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Coffee,
  LogOut,
  QrCode,
  RefreshCw,
  Gift,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { StampCard } from "@/components/loyalty/stamp-card";
import { CustomerQR } from "@/components/dashboard/customer-qr";
import { VisitHistory } from "@/components/dashboard/visit-history";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Profile = {
  user: Database["public"]["Tables"]["users"]["Row"];
  card: Database["public"]["Tables"]["loyalty_cards"]["Row"];
};

export function CustomerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const prevStampsRef = useRef<number | null>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const loadProfile = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const response = await fetch("/api/profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      
      const json = await response.json().catch(() => null) as Profile | { error: string } | null;

      if (!response.ok || !json || "error" in json) {
        setError(json && "error" in json ? json.error : "No pudimos cargar tu tarjeta.");
        return;
      }

      setProfile(json);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Error al conectar con el servidor."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        void loadProfile({ silent: true });
      }
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    await fetch("/api/auth/customer-logout", { method: "POST" });
    window.location.href = "/";
  };


  // Canvas Confetti logic
  const triggerConfetti = () => {
    const canvas = document.getElementById("confetti-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const logoImg = new Image();
    logoImg.src = "/logo-circle.png";

    const colors = ["#d4af37", "#f5f5f5", "#ffffff", "#aa7c11", "#b89742"];
    const types: Array<"bean" | "cup" | "logo"> = ["bean", "cup", "logo"];
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      wobble: number;
      wobbleSpeed: number;
      type: "bean" | "cup" | "logo";
    }> = [];

    // Populate particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height - 40,
        size: Math.random() * 8 + 14, // size range 14px - 22px
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 3 - 1.5,
        speedY: Math.random() * 3.5 + 2.5,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 3 - 1.5,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.04 + 0.02,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 4500) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.6;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.type === "bean") {
          // Draw a detailed coffee bean
          ctx.fillStyle = "#5c3a21"; // Espresso brown
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.7, p.size * 0.45, 0, 0, 2 * Math.PI);
          ctx.fill();

          // Crease down the center
          ctx.strokeStyle = "#331f11";
          ctx.lineWidth = p.size * 0.08;
          ctx.beginPath();
          ctx.moveTo(-p.size * 0.7, 0);
          ctx.bezierCurveTo(-p.size * 0.2, p.size * 0.1, p.size * 0.2, -p.size * 0.1, p.size * 0.7, 0);
          ctx.stroke();
        } else if (p.type === "cup") {
          // Draw takeaway cup shape
          ctx.fillStyle = "#d4af37"; // Brand gold
          ctx.beginPath();
          ctx.moveTo(-p.size * 0.4, -p.size * 0.35);
          ctx.lineTo(p.size * 0.4, -p.size * 0.35);
          ctx.lineTo(p.size * 0.28, p.size * 0.45);
          ctx.lineTo(-p.size * 0.28, p.size * 0.45);
          ctx.closePath();
          ctx.fill();

          // Cup band (white sleeve)
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(-p.size * 0.35, -p.size * 0.1);
          ctx.lineTo(p.size * 0.35, -p.size * 0.1);
          ctx.lineTo(p.size * 0.31, p.size * 0.2);
          ctx.lineTo(-p.size * 0.31, p.size * 0.2);
          ctx.closePath();
          ctx.fill();

          // Lid (dark brown)
          ctx.fillStyle = "#331f11";
          ctx.beginPath();
          ctx.rect(-p.size * 0.45, -p.size * 0.55, p.size * 0.9, p.size * 0.2);
          ctx.fill();
        } else {
          // Draw the Punto Café circular logo
          if (logoImg.complete && logoImg.naturalWidth !== 0) {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.75, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(logoImg, -p.size * 0.75, -p.size * 0.75, p.size * 1.5, p.size * 1.5);
          } else {
            // Golden circular badge fallback
            ctx.fillStyle = "#d4af37";
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.7, 0, 2 * Math.PI);
            ctx.fill();

            ctx.strokeStyle = "#1b110b";
            ctx.lineWidth = p.size * 0.08;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.45, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.fillStyle = "#1b110b";
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.18, 0, 2 * Math.PI);
            ctx.fill();
          }
        }

        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();
  };

  // Update polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const startPolling = () => {
      interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          void loadProfile({ silent: true });
        }
      }, 3000);
    };
    
    startPolling();
    return () => clearInterval(interval);
  }, [supabase]);

  // Toast and Sound logic
  const [toast, setToast] = useState<{ message: string, type: "success" | "reward" } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const ensureAudioContext = () => {
    try {
      let ctx = audioCtxRef.current;
      if (!ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          ctx = new AudioContextClass();
          audioCtxRef.current = ctx;
        }
      }
      
      if (ctx) {
        if (ctx.state !== "running") {
          ctx.resume().catch(err => {
            console.warn("Could not resume AudioContext (waiting for user gesture):", err);
          });
        }
        // Synchronously create and start a silent buffer source within the user gesture stack
        try {
          const buffer = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
        } catch (e) {
          // ignore warmup failures
        }
      }
      return ctx;
    } catch (err) {
      console.error("Failed to ensure AudioContext:", err);
      return null;
    }
  };

  useEffect(() => {
    const handleGesture = () => {
      ensureAudioContext();
    };

    const events = ["click", "touchstart", "touchend", "mousedown", "pointerdown"];
    events.forEach(event => {
      window.addEventListener(event, handleGesture);
      document.addEventListener(event, handleGesture);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleGesture);
        document.removeEventListener(event, handleGesture);
      });
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        if (ctx.state !== "running") {
          ctx.resume().catch(() => {
            // Silently ignore if blocked by browser policy
          });
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const playSuccessSound = () => {
    try {
      const ctx = ensureAudioContext();
      if (!ctx) return;

      const runSound = (c: AudioContext) => {
        const playTone = (freq: number, startTime: number) => {
          const osc = c.createOscillator();
          const gainNode = c.createGain();
          osc.type = "sine";
          osc.connect(gainNode);
          gainNode.connect(c.destination);
          osc.frequency.setValueAtTime(freq, startTime);
          gainNode.gain.setValueAtTime(0.35, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);
          osc.start(startTime);
          osc.stop(startTime + 0.5);
        };
        const now = c.currentTime;
        playTone(523.25, now); // C5
        playTone(659.25, now + 0.15); // E5
      };

      if (ctx.state !== "running") {
        ctx.resume().then(() => {
          runSound(ctx);
        }).catch(err => console.error("Resume failed during playSuccessSound", err));
      } else {
        runSound(ctx);
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const playRedeemSound = () => {
    try {
      const ctx = ensureAudioContext();
      if (!ctx) return;

      const runSound = (c: AudioContext) => {
        const now = c.currentTime;

        const playSynthNote = (freq: number, startTime: number, duration: number, volume: number = 0.25) => {
          const filter = c.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(1500, startTime);
          filter.Q.setValueAtTime(1, startTime);
          filter.connect(c.destination);

          const gainNode = c.createGain();
          gainNode.connect(filter);
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

          const osc1 = c.createOscillator();
          osc1.type = "triangle";
          osc1.frequency.setValueAtTime(freq, startTime);
          osc1.connect(gainNode);

          const osc2 = c.createOscillator();
          osc2.type = "sawtooth";
          osc2.frequency.setValueAtTime(freq + 2, startTime);
          osc2.connect(gainNode);

          const osc3 = c.createOscillator();
          osc3.type = "sine";
          osc3.frequency.setValueAtTime(freq / 2, startTime);
          osc3.connect(gainNode);

          osc1.start(startTime);
          osc2.start(startTime);
          osc3.start(startTime);

          osc1.stop(startTime + duration);
          osc2.stop(startTime + duration);
          osc3.stop(startTime + duration);
        };

        playSynthNote(261.63, now, 1.2, 0.3); // C4 Bass
        playSynthNote(392.00, now + 0.08, 1.0, 0.2); // G4
        playSynthNote(523.25, now + 0.16, 0.9, 0.2); // C5
        playSynthNote(659.25, now + 0.24, 0.8, 0.2); // E5
        playSynthNote(783.99, now + 0.32, 0.7, 0.2); // G5
        playSynthNote(987.77, now + 0.40, 0.8, 0.2); // B5 (Maj7 flavor!)
        playSynthNote(1046.50, now + 0.48, 1.0, 0.35); // C6 Triumph
        playSynthNote(1318.51, now + 0.56, 1.2, 0.25); // E6 glitter
      };

      if (ctx.state !== "running") {
        ctx.resume().then(() => {
          runSound(ctx);
        }).catch(err => console.error("Resume failed during playRedeemSound", err));
      } else {
        runSound(ctx);
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  useEffect(() => {
    if (profile?.card) {
      if (prevStampsRef.current !== null) {
        if (profile.card.stamps > prevStampsRef.current) {
          const isReward = profile.card.stamps >= 5;
          playSuccessSound();
          setToast({
            message: isReward ? "¡Completaste tus 5 sellos! Café gratis." : "¡Sello Ganado!",
            type: isReward ? "reward" : "success"
          });
          
          setTimeout(() => setToast(null), 4000);
          setTimeout(() => triggerConfetti(), 100);
        } else if (prevStampsRef.current >= 5 && profile.card.stamps === 0) {
          // They just redeemed their free coffee!
          playRedeemSound();
          setToast({
            message: "¡Canje Exitoso! Disfrutá tu café de regalo. ☕✨",
            type: "reward"
          });
          
          setTimeout(() => setToast(null), 4000);
          setTimeout(() => triggerConfetti(), 100);
        }
      }
      prevStampsRef.current = profile.card.stamps;
    }
  }, [profile?.card?.stamps]);

  // Supabase Realtime Subscription (Fall back to polling if not enabled)
  useEffect(() => {
    if (!profile?.card?.id) return;

    const channel = supabase
      .channel(`realtime-stamps-${profile.card.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "loyalty_cards",
          filter: `id=eq.${profile.card.id}`,
        },
        (payload) => {
          const newCard = payload.new as Database["public"]["Tables"]["loyalty_cards"]["Row"];
          if (newCard) {
            setProfile((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                card: newCard,
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.card?.id, supabase]);

  if (loading) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <p className="text-sm font-medium text-espresso/60">Cargando tarjeta...</p>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <div className="glass-panel max-w-sm rounded-lg p-6 text-center shadow-soft">
          <p className="font-medium text-espresso">{error}</p>
          <Button className="mt-5" onClick={() => (window.location.href = "/")}>
            Volver
          </Button>
        </div>
      </main>
    );
  }

  const rewardReady = profile.card.stamps >= 5;

  return (
    <main className="min-h-dvh px-4 py-5 sm:px-6 lg:px-8 relative">
      {/* Canvas for native confetti animation */}
      <canvas id="confetti-canvas" className="pointer-events-none fixed inset-0 z-50 w-full h-full" />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 relative z-10">
        <header className="flex items-center justify-between gap-4">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Button
              onClick={() => loadProfile({ silent: true })}
              variant="ghost"
              className="h-10 px-3"
              loading={refreshing}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <Button onClick={signOut} variant="ghost" className="h-10 px-3">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </header>

        <section className="grid gap-5">
          <div
            className={`relative group perspective-1000 glass-panel rounded-2xl p-8 md:p-10 text-center ${
              rewardReady ? "border-brand-accent/30 bg-brand-accent/5" : ""
            }`}
          >
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-accent/10 border border-brand-accent/20 text-brand-accent">
              <QrCode className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              {rewardReady ? "Recompensa lista" : "Para sumar sellos"}
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl">
              {rewardReady ? "Tenés café gratis" : "Dictá tu DNI y código"}
            </h1>
            <p className="mx-auto mt-3 mb-6 max-w-md text-sm text-gray-400">
              {rewardReady
                ? "Mostrá esta pantalla para canjear tu recompensa en el mostrador."
                : "El barista te pedirá el DNI o escaneará el código QR para sumar tu sello."}
            </p>

            {!rewardReady && <CustomerQR dni={profile.user.dni || ""} />}

            <div className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-brand-accent">
              <Coffee className="h-4 w-4" />
              {profile.card.stamps}/5 sellos acumulados
            </div>
          </div>

          <StampCard
            customerName={profile.user.full_name}
            stamps={profile.card.stamps}
            totalRewards={profile.card.total_rewards}
          />



          <VisitHistory />
        </section>
      </div>



      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in flex flex-col items-center pointer-events-none">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${toast.type === 'reward' ? 'bg-brand-accent/20 border-brand-accent/30 text-brand-accent' : 'bg-green-500/20 border-green-500/30 text-green-400'} font-bold flex items-center gap-3`}>
            {toast.type === 'reward' ? <Gift className="h-6 w-6" /> : <Coffee className="h-6 w-6 animate-pulse" />}
            <span className="text-lg tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}
    </main>
  );
}
