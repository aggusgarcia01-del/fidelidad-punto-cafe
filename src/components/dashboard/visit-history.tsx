"use client";

import { useEffect, useState } from "react";
import { Coffee, Gift } from "lucide-react";

type LoyaltyEvent = {
  id: string;
  type: "stamp_added" | "reward_redeemed";
  stamps_after: number;
  created_at: string;
  note: string | null;
};

export function VisitHistory() {
  const [events, setEvents] = useState<LoyaltyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/events");
        const json = await response.json();
        if (response.ok && Array.isArray(json)) {
          setEvents(json);
        }
      } catch (error) {
        console.error("Error loading visit history", error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 glass-panel rounded-2xl p-6 border border-white/5 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 w-full bg-white/5 rounded-xl"></div>
          <div className="h-12 w-full bg-white/5 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 glass-panel rounded-2xl p-6 border border-white/5">
      <h3 className="text-sm font-bold uppercase tracking-widest text-brand-accent mb-4">Mis Últimas Visitas</h3>
      <div className="space-y-3">
        {events.map((event) => {
          const isReward = event.type === "reward_redeemed";
          return (
            <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isReward ? "bg-brand-accent/20 text-brand-accent" : "bg-white/10 text-white"}`}>
                  {isReward ? <Gift className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {isReward ? "Recompensa canjeada" : "Sello sumado"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(event.created_at).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {!isReward && (
                <div className="text-right">
                  <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-md text-white">
                    {event.stamps_after}/5
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
