"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Apple,
  Coffee,
  LogOut,
  QrCode,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { StampCard } from "@/components/loyalty/stamp-card";
import { StampCode } from "@/components/StampCode";
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
              {rewardReady ? "Tenes cafe gratis" : "Dicta tu DNI y código"}
            </h1>
            <p className="mx-auto mt-3 mb-6 max-w-md text-sm leading-6 text-espresso/58">
              {rewardReady
                ? "Mostra esta pantalla para canjear tu recompensa en el mostrador."
                : "El barista te pedirá el DNI y este código para sumar tu sello."}
            </p>

            {!rewardReady && <StampCode dni={profile.user.dni} />}

            <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-espresso/58">
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
    </main>
  );
}
