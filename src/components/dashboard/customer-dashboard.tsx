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

    const colors = ["#d4af37", "#f5f5f5", "#ffffff", "#aa7c11", "#b89742"];
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Populate particles
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height - 20,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 5 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2,
      });
    }

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > 4000) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
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

  useEffect(() => {
    // Initialize/resume AudioContext on user interaction to bypass autoplay restrictions
    const initAudio = () => {
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
          if (ctx.state === "suspended") {
            ctx.resume();
          }
          // Play silent buffer to unlock iOS Safari Web Audio
          const buffer = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
        }
      } catch (err) {
        console.error("Failed to initialize or unlock AudioContext:", err);
      }
    };

    const events = ["click", "touchstart", "touchend", "mousedown", "pointerdown"];
    events.forEach(event => {
      window.addEventListener(event, initAudio);
      document.addEventListener(event, initAudio);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, initAudio);
        document.removeEventListener(event, initAudio);
      });
    };
  }, []);

  const playSuccessSound = () => {
    try {
      let ctx = audioCtxRef.current;
      if (!ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          ctx = new AudioContextClass();
          audioCtxRef.current = ctx;
        }
      }
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

      if (ctx.state === "suspended") {
        ctx.resume().then(() => {
          if (audioCtxRef.current) {
            runSound(audioCtxRef.current);
          }
        }).catch(err => console.error("Resume failed", err));
      } else {
        runSound(ctx);
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  useEffect(() => {
    if (profile?.card) {
      if (prevStampsRef.current !== null && profile.card.stamps > prevStampsRef.current) {
        const isReward = profile.card.stamps >= 5;
        playSuccessSound();
        setToast({
          message: isReward ? "¡Completaste tus 5 sellos! Café gratis." : "¡Sello Ganado!",
          type: isReward ? "reward" : "success"
        });
        
        setTimeout(() => setToast(null), 4000);
        setTimeout(() => triggerConfetti(), 100);
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
