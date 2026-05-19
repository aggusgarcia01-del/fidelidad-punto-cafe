"use client";

import { useState, useEffect, useCallback } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Coffee,
  CheckCircle,
  LogOut,
  Search,
  Plus,
  Check,
  Gift,
  RefreshCw,
  X,
  ChevronRight
} from "lucide-react";
import type { Database, LoyaltyCustomer, LoyaltyEvent } from "@/types/database";

type SuccessData = { customerName: string; stamps: number; message: string };
type Card = Database["public"]["Tables"]["loyalty_cards"]["Row"];

function getCard(customer: LoyaltyCustomer): Card | null {
  if (Array.isArray(customer.loyalty_cards)) {
    return customer.loyalty_cards[0] ?? null;
  }
  return customer.loyalty_cards;
}

export default function AdminPage() {
  const [isLogged, setIsLogged] = useState(false);
  const [pin, setPin] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<LoyaltyCustomer | null>(null);
  const [history, setHistory] = useState<LoyaltyEvent[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Form states
  const [dni, setDni] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessData | null>(null);

  // Check initial session
  useEffect(() => {
    fetch("/api/admin/customers?q=ping").then((res) => {
      if (res.ok) setIsLogged(true);
    });
  }, []);

  const loadCustomers = useCallback(async (query = "") => {
    try {
      const response = await fetch(`/api/admin/customers?q=${encodeURIComponent(query)}`);
      if (response.status === 401) {
        setIsLogged(false);
        return;
      }
      if (response.ok) {
        const json = await response.json();
        setCustomers(json.customers ?? []);
      }
    } catch (err) {
      console.error("Error al cargar clientes", err);
    }
  }, []);

  useEffect(() => {
    if (isLogged) {
      void loadCustomers("");
    }
  }, [isLogged, loadCustomers]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ pin }),
      });
      if (!response.ok) {
        setError("PIN inválido.");
        return;
      }
      setIsLogged(true);
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLogged(false);
    setSelectedCustomer(null);
  };

  const selectCustomer = async (customer: LoyaltyCustomer) => {
    setSelectedCustomer(customer);
    setDni(customer.dni || "");
    setCode("");
    setError(null);
    setSuccess(null);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/history?userId=${customer.id}`);
      if (res.ok) {
        const json = await res.json();
        setHistory(json.events ?? []);
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  const addStamp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/add-stamp", {
        method: "POST",
        body: JSON.stringify({ dni, code }),
      });
      const json = await response.json();
      
      if (!response.ok) {
        setError(json.error || "No se pudo agregar el sello.");
        return;
      }

      setSuccess({
        customerName: json.customerName,
        stamps: json.stamps,
        message: json.message
      });
      setCode("");

      // Refresh data
      void loadCustomers(searchQuery);
      if (selectedCustomer) {
        const card = getCard(selectedCustomer);
        if (card) {
          const updatedCard = { ...card, stamps: json.stamps };
          const updatedCustomer = { ...selectedCustomer, loyalty_cards: [updatedCard] };
          setSelectedCustomer(updatedCustomer);
          selectCustomer(updatedCustomer);
        }
      }

      // Return to form/clean state after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async () => {
    if (!selectedCustomer) return;
    const confirmed = window.confirm(
      `¿Confirmar canje de café gratis para ${selectedCustomer.full_name}?`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/redeem", {
        method: "POST",
        body: JSON.stringify({ userId: selectedCustomer.id }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "No se pudo canjear la recompensa.");
        return;
      }

      setSuccess({
        customerName: selectedCustomer.full_name,
        stamps: 0,
        message: json.message || "¡Café canjeado con éxito!"
      });

      // Refresh
      void loadCustomers(searchQuery);
      if (json.card) {
        const updatedCustomer = { ...selectedCustomer, loyalty_cards: [json.card] };
        setSelectedCustomer(updatedCustomer);
        selectCustomer(updatedCustomer);
      }

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    void loadCustomers(val);
  };

  if (!isLogged) {
    return (
      <main className="grid min-h-dvh place-items-center px-4 bg-[#f6f1eb]">
        <form
          onSubmit={login}
          className="glass-panel w-full max-w-sm rounded-2xl p-8 shadow-soft"
        >
          <div className="flex justify-center mb-8">
            <BrandMark />
          </div>
          <h1 className="text-2xl font-semibold text-center text-espresso">
            Acceso Barista
          </h1>
          <p className="mt-2 text-sm text-center text-espresso/60 mb-8">
            Ingresa el PIN de seguridad de la sucursal.
          </p>
          <Input
            label="PIN de seguridad"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            className="text-center text-2xl tracking-widest"
            autoFocus
          />
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 text-center">
              {error}
            </p>
          )}
          <Button className="mt-8 w-full h-12 text-lg" loading={loading} type="submit">
            Entrar
          </Button>
        </form>
      </main>
    );
  }

  const selectedStamps = selectedCustomer ? (getCard(selectedCustomer)?.stamps ?? 0) : 0;
  const isRewardReady = selectedStamps >= 5;

  return (
    <main className="min-h-dvh bg-[#f6f1eb] pb-10">
      <header className="border-b border-espresso/5 bg-cream/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-caramel bg-caramel/10 px-3 py-1.5 rounded-full">
              Panel Barista Activo
            </span>
            <Button onClick={logout} variant="ghost" className="text-espresso/60 hover:text-espresso">
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-[380px_1fr]">
        
        {/* Left Side: Search & Customers List */}
        <section className="glass-panel rounded-2xl p-6 shadow-soft h-[calc(100vh-140px)] flex flex-col min-w-0">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-espresso mb-1">Clientes Registrados</h2>
            <p className="text-xs text-espresso/50">Busca y selecciona un cliente de la lista</p>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-espresso/40" />
            <input
              type="text"
              placeholder="Buscar por Nombre, DNI, Email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-[#fcfbfa] border border-espresso/10 rounded-xl py-3 pl-10 pr-4 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-caramel/20 focus:border-caramel placeholder:text-espresso/40 transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {customers.length > 0 ? (
              customers.map((c) => {
                const card = getCard(c);
                const stampsCount = card?.stamps ?? 0;
                const isSelected = selectedCustomer?.id === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => selectCustomer(c)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-espresso border-espresso text-cream shadow-md"
                        : "bg-[#fcfbfa] border-espresso/5 hover:border-caramel/40 text-espresso"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-sm truncate">{c.full_name}</p>
                      <p className={`text-xs mt-1 truncate ${isSelected ? "text-cream/70" : "text-espresso/60"}`}>
                        DNI: {c.dni || "Sin DNI"}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isSelected
                        ? "bg-caramel text-white"
                        : stampsCount >= 5
                        ? "bg-caramel/20 text-caramel animate-pulse"
                        : "bg-espresso/5 text-espresso/70"
                    }`}>
                      <Coffee className="h-3 w-3" />
                      <span>{stampsCount}/5</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-10 text-espresso/40 text-sm">
                No se encontraron clientes.
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Active Operations Panel */}
        <section className="flex flex-col gap-6">
          
          {success ? (
            <div className="glass-panel rounded-2xl p-10 shadow-lift flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 min-h-[400px]">
              <div className="h-24 w-24 rounded-full bg-caramel/10 flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-caramel animate-bounce" />
              </div>
              <h2 className="text-3xl font-extrabold text-espresso mb-2">¡Operación Exitosa!</h2>
              <p className="text-xl font-medium text-espresso/80 mb-4">{success.customerName}</p>
              <p className="text-sm text-espresso/60 bg-porcelain px-6 py-2.5 rounded-full font-medium max-w-sm">
                {success.message}
              </p>
              
              <div className="mt-8 flex items-center justify-center gap-3 bg-espresso text-cream rounded-full px-8 py-4 shadow-lg">
                <Coffee className="h-6 w-6 text-caramel" />
                <span className="font-extrabold text-xl">{success.stamps} / 5 sellos</span>
              </div>
              <p className="mt-10 text-xs text-espresso/40 animate-pulse">Volviendo al panel...</p>
            </div>
          ) : selectedCustomer ? (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-lift space-y-8 animate-in fade-in duration-200">
              <div className="flex items-start justify-between border-b border-espresso/5 pb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-caramel">
                    Cliente Seleccionado
                  </span>
                  <h2 className="text-3xl font-bold text-espresso mt-1">{selectedCustomer.full_name}</h2>
                  <div className="flex flex-wrap gap-4 text-xs text-espresso/60 mt-2 font-medium">
                    <p>DNI: <span className="text-espresso font-bold">{selectedCustomer.dni || "—"}</span></p>
                    <p>Tel: <span className="text-espresso font-bold">{selectedCustomer.phone || "—"}</span></p>
                    <p>Email: <span className="text-espresso font-bold">{selectedCustomer.email || "—"}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setDni("");
                    setCode("");
                    setError(null);
                  }}
                  className="p-2 hover:bg-espresso/5 rounded-lg text-espresso/50 hover:text-espresso transition-all"
                  title="Deseleccionar cliente"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Stamps Progress Bar */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-espresso">
                  <span>Progreso de la Tarjeta</span>
                  <span className="bg-espresso text-cream px-3 py-1 rounded-full text-xs">
                    {selectedStamps}/5 sellos acumulados
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const active = idx < selectedStamps;
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                          active
                            ? "border-caramel bg-caramel text-white shadow-md scale-105"
                            : "border-espresso/10 bg-porcelain text-espresso/20"
                        }`}
                      >
                        <Coffee className={`h-8 w-8 ${active ? "animate-pulse" : ""}`} />
                        <span className="text-[10px] font-bold uppercase">Taza {idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Operations */}
              <div className="grid gap-6 pt-4 sm:grid-cols-2">
                
                {/* Stamp Form */}
                <form onSubmit={addStamp} className="bg-porcelain/50 rounded-xl p-5 border border-espresso/5 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-espresso text-base mb-1 flex items-center gap-2">
                      <Plus className="h-4 w-4 text-caramel" /> Sumar Sello
                    </h3>
                    <p className="text-xs text-espresso/60 mb-4">
                      Ingresa el código temporal de 4 dígitos generado en la app del cliente.
                    </p>
                    <Input
                      label="Código Rotativo"
                      placeholder="----"
                      type="tel"
                      maxLength={4}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      required
                      className="text-2xl text-center tracking-[0.8em] font-mono"
                    />
                  </div>
                  {error && (
                    <p className="mt-3 text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg text-center">
                      {error}
                    </p>
                  )}
                  <Button
                    className="mt-6 w-full h-12 text-sm bg-caramel hover:bg-caramel/90 text-white font-bold"
                    loading={loading}
                    type="submit"
                  >
                    Confirmar Sello
                  </Button>
                </form>

                {/* Redeem Form */}
                <div className={`rounded-xl p-5 border flex flex-col justify-between ${
                  isRewardReady
                    ? "bg-caramel/10 border-caramel/30"
                    : "bg-porcelain/30 border-espresso/5 opacity-70"
                }`}>
                  <div>
                    <h3 className="font-bold text-espresso text-base mb-1 flex items-center gap-2">
                      <Gift className="h-4 w-4 text-caramel" /> Canjear Café Gratis
                    </h3>
                    <p className="text-xs text-espresso/60">
                      Cuando el cliente alcanza los 5 sellos, puedes entregarle su café gratis y reiniciar la tarjeta.
                    </p>
                    {isRewardReady ? (
                      <div className="mt-4 flex items-center gap-2.5 text-caramel bg-caramel/10 px-4 py-3 rounded-lg border border-caramel/20">
                        <Check className="h-5 w-5 stroke-[3px]" />
                        <span className="text-xs font-bold uppercase tracking-wider">¡El canje está disponible!</span>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center gap-2.5 text-espresso/40 bg-espresso/5 px-4 py-3 rounded-lg">
                        <X className="h-4 w-4" />
                        <span className="text-xs font-medium">Aún le faltan {5 - selectedStamps} sellos.</span>
                      </div>
                    )}
                  </div>
                  <Button
                    className={`mt-6 w-full h-12 text-sm font-bold ${
                      isRewardReady
                        ? "bg-espresso hover:bg-espresso/90 text-cream"
                        : "bg-espresso/10 text-espresso/40 cursor-not-allowed"
                    }`}
                    disabled={!isRewardReady}
                    loading={loading}
                    onClick={redeemReward}
                  >
                    Entregar Café Gratis
                  </Button>
                </div>
              </div>

              {/* History */}
              <div className="border-t border-espresso/5 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-espresso/50 mb-4">
                  Historial de Movimientos
                </h3>
                {loadingHistory ? (
                  <p className="text-sm text-espresso/50 animate-pulse">Cargando historial...</p>
                ) : history.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {history.map((h) => {
                      const isStamp = h.type === "stamp_added";
                      return (
                        <div key={h.id} className="flex justify-between items-center text-xs p-3 rounded-lg bg-porcelain">
                          <div>
                            <p className="font-bold text-espresso">
                              {isStamp ? "Sello Agregado" : "Recompensa Canjeada"}
                            </p>
                            <p className="text-[10px] text-espresso/50 mt-0.5">
                              {new Date(h.created_at).toLocaleString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <span className={`font-bold px-2 py-1 rounded ${
                            isStamp ? "text-caramel bg-caramel/10" : "text-emerald-700 bg-emerald-50"
                          }`}>
                            {h.stamps_before} → {h.stamps_after}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-espresso/50 italic bg-porcelain p-4 rounded-xl text-center">
                    Aún no hay movimientos registrados para este cliente.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Blank state: Quick operations form */
            <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-lift space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl font-bold text-espresso mb-1">Carga Rápida de Sellos</h2>
                <p className="text-sm text-espresso/60">
                  Si tienes el DNI y código a mano, ingrésalos aquí directamente. O selecciona un cliente a la izquierda.
                </p>
              </div>

              <form onSubmit={addStamp} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Input
                    label="DNI del Cliente"
                    placeholder="Ej. 34567890"
                    type="tel"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required
                    className="text-lg"
                  />
                  <Input
                    label="Código de 4 dígitos"
                    placeholder="----"
                    type="tel"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    className="text-xl text-center tracking-[0.5em] font-mono"
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 text-center">
                    {error}
                  </p>
                )}

                <Button
                  className="w-full h-14 text-lg bg-caramel hover:bg-caramel/90 text-white font-bold"
                  loading={loading}
                  type="submit"
                >
                  Confirmar Sello
                </Button>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

