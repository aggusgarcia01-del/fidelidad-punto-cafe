"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  Apple,
  Coffee,
  LogOut,
  QrCode,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { StampCard } from "@/components/loyalty/stamp-card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Profile = {
  user: Database["public"]["Tables"]["users"]["Row"];
  card: Database["public"]["Tables"]["loyalty_cards"]["Row"];
};

export function CustomerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const json = (await response.json()) as Profile | { error: string };

      if (!response.ok || "error" in json) {
        setError("No pudimos cargar tu tarjeta.");
        setLoading(false);
        return;
      }

      setProfile(json);
      const qrPayload = JSON.stringify({
        type: "puntocafe_loyalty",
        userId: json.user.id,
        email: json.user.email,
      });
      setQr(await QRCode.toDataURL(qrPayload, { margin: 1, width: 320 }));
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

  const openWallet = async (provider: "apple" | "google") => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const response = await fetch(`/api/wallet/${provider}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const json = await response.json();
    alert(json.message ?? "Wallet listo para configurar.");
  };

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
    <main className="min-h-dvh px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
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
            className={`glass-panel rounded-lg p-5 text-center shadow-soft sm:p-6 ${
              rewardReady ? "ring-2 ring-caramel" : ""
            }`}
          >
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-caramel/16 text-caramel">
              <QrCode className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-caramel">
              {rewardReady ? "Recompensa lista" : "Para sumar sellos"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-espresso sm:text-4xl">
              {rewardReady ? "Tenes cafe gratis" : "Mostra este QR en caja"}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-espresso/58">
              {rewardReady
                ? "Mostra este QR para canjear tu recompensa en el mostrador."
                : "El barista lo escanea y suma tu sello en segundos."}
            </p>

            <button
              className="mx-auto mt-6 grid w-full max-w-xs place-items-center rounded-lg bg-porcelain p-4 shadow-lift transition hover:scale-[1.01]"
              onClick={() => setQrOpen(true)}
              type="button"
            >
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qr}
                  alt="QR de fidelizacion PuntoCafe"
                  className="h-64 w-64 rounded-lg"
                />
              ) : null}
            </button>

            <Button className="mt-5 w-full sm:w-auto" onClick={() => setQrOpen(true)}>
              <QrCode className="h-4 w-4" />
              Mostrar QR grande
            </Button>

            <div className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-espresso/58">
              <Coffee className="h-4 w-4 text-caramel" />
              {profile.card.stamps}/5 sellos acumulados
            </div>
          </div>

          <StampCard
            customerName={profile.user.full_name}
            stamps={profile.card.stamps}
            totalRewards={profile.card.total_rewards}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={() => openWallet("apple")} variant="secondary">
              <Apple className="h-4 w-4" />
              Apple Wallet
            </Button>
            <Button onClick={() => openWallet("google")} variant="secondary">
              <Wallet className="h-4 w-4" />
              Google Wallet
            </Button>
          </div>
        </section>
      </div>

      {qrOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-espresso/92 px-4 py-6">
          <div className="w-full max-w-sm rounded-lg bg-cream p-5 text-center shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-left text-sm font-semibold uppercase tracking-[0.18em] text-caramel">
                PuntoCafe QR
              </p>
              <button
                aria-label="Cerrar QR"
                className="grid h-10 w-10 place-items-center rounded-lg bg-espresso/8 text-espresso"
                onClick={() => setQrOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid place-items-center rounded-lg bg-porcelain p-4">
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qr}
                  alt="QR de fidelizacion PuntoCafe"
                  className="h-72 w-72 rounded-lg"
                />
              ) : null}
            </div>
            <p className="mt-4 text-sm font-medium text-espresso/62">
              {profile.user.full_name}
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
