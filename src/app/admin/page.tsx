"use client";

import { useState, useEffect, useCallback } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import {
  Coffee,
  CheckCircle,
  LogOut,
  Search,
  Plus,
  Check,
  Gift,
  X,
  Edit2
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

function isBirthdayToday(birthDateStr: string | null | undefined): boolean {
  if (!birthDateStr) return false;
  try {
    const today = new Date();
    const birthDate = new Date(birthDateStr + "T12:00:00");
    return (
      today.getDate() === birthDate.getDate() &&
      today.getMonth() === birthDate.getMonth()
    );
  } catch {
    return false;
  }
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

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ fullName: "", phone: "", dni: "", birthDate: "" });

  const birthdayToday = selectedCustomer ? isBirthdayToday(selectedCustomer.birth_date) : false;

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
    setIsEditing(false);
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

  const startEdit = () => {
    setEditData({
      fullName: selectedCustomer?.full_name || "",
      phone: selectedCustomer?.phone || "",
      dni: selectedCustomer?.dni || "",
      birthDate: selectedCustomer?.birth_date || ""
    });
    setIsEditing(true);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/update-customer", {
        method: "POST",
        body: JSON.stringify({
          userId: selectedCustomer.id,
          fullName: editData.fullName,
          phone: editData.phone,
          dni: editData.dni,
          birthDate: editData.birthDate
        })
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "No se pudo actualizar el cliente");
      }
      const updatedCustomer = {
        ...selectedCustomer,
        full_name: editData.fullName,
        phone: editData.phone,
        dni: editData.dni,
        birth_date: editData.birthDate
      };
      setSelectedCustomer(updatedCustomer);
      setIsEditing(false);
      void loadCustomers(searchQuery);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
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
      <main className="grid min-h-dvh place-items-center px-4 bg-primary-container relative">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-fixed-dim/5 to-transparent blur-3xl" />
        <form
          onSubmit={login}
          className="relative bg-tertiary-container/40 backdrop-blur-xl border border-surface-variant/10 w-full max-w-sm rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-10"
        >
          <div className="flex justify-center mb-8">
            <BrandMark />
          </div>
          <h1 className="text-2xl font-semibold text-center text-inverse-on-surface">
            Acceso Barista
          </h1>
          <p className="mt-2 text-sm text-center text-surface-variant/80 mb-8">
            Ingresa el PIN de seguridad de la sucursal.
          </p>
          <div className="relative pt-2 mb-2">
            <input 
              className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-2 text-center text-2xl tracking-[0.5em] text-inverse-on-surface focus:ring-0 focus:border-secondary-fixed-dim transition-colors placeholder-transparent" 
              id="pin" 
              placeholder="PIN" 
              required 
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
          </div>
          {error && (
            <p className="mt-4 rounded-lg bg-red-900/20 border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 text-center">
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
    <main className="min-h-dvh bg-primary-container pb-10 relative">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-secondary-fixed-dim/5 to-transparent pointer-events-none" />
      
      <header className="border-b border-surface-variant/10 bg-primary-container/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary-fixed-dim bg-surface-variant/10 px-3 py-1.5 rounded-full">
              Panel Barista Activo
            </span>
            <Button onClick={logout} variant="ghost" className="text-surface-variant/60 hover:text-inverse-on-surface">
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-[380px_1fr] relative z-10">
        
        {/* Left Side: Search & Customers List */}
        <section className="bg-tertiary-container/40 backdrop-blur-xl border border-surface-variant/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] h-[calc(100vh-140px)] flex flex-col min-w-0">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-inverse-on-surface mb-1">Clientes Registrados</h2>
            <p className="text-xs text-surface-variant/60">Busca y selecciona un cliente de la lista</p>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-surface-variant/40" />
            <input
              type="text"
              placeholder="Buscar por Nombre, DNI, Email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-surface-variant/5 border border-surface-variant/20 rounded-xl py-3 pl-10 pr-4 text-sm text-inverse-on-surface focus:outline-none focus:ring-1 focus:ring-secondary-fixed-dim focus:border-secondary-fixed-dim placeholder:text-surface-variant/40 transition-all"
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
                        ? "bg-secondary-fixed-dim border-secondary-fixed-dim text-primary-container shadow-[0_4px_20px_rgba(214,196,171,0.2)]"
                        : "bg-surface-variant/5 border-surface-variant/10 hover:border-secondary-fixed-dim/40 text-inverse-on-surface"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-sm truncate">{c.full_name}</p>
                      <p className={`text-xs mt-1 truncate ${isSelected ? "text-primary-container/70" : "text-surface-variant/60"}`}>
                        DNI: {c.dni || "Sin DNI"}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isSelected
                        ? "bg-inverse-on-surface text-primary-container"
                        : stampsCount >= 5
                        ? "bg-secondary-fixed-dim/20 text-secondary-fixed-dim animate-pulse border border-secondary-fixed-dim/20"
                        : "bg-surface-variant/10 text-surface-variant/70 border border-surface-variant/10"
                    }`}>
                      <Coffee className="h-3 w-3" />
                      <span>{stampsCount}/5</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-10 text-surface-variant/40 text-sm">
                No se encontraron clientes.
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Active Operations Panel */}
        <section className="flex flex-col gap-6">
          
          {success ? (
            <div className="bg-tertiary-container/40 backdrop-blur-xl border border-surface-variant/10 rounded-2xl p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 min-h-[400px]">
              <div className="h-24 w-24 rounded-full bg-secondary-fixed-dim/10 border border-secondary-fixed-dim/20 flex items-center justify-center mb-6">
                <CheckCircle className="h-12 w-12 text-secondary-fixed-dim animate-bounce" />
              </div>
              <h2 className="text-3xl font-extrabold text-inverse-on-surface mb-2">¡Operación Exitosa!</h2>
              <p className="text-xl font-medium text-surface-variant/80 mb-4">{success.customerName}</p>
              <p className="text-sm text-secondary-fixed-dim bg-secondary-fixed-dim/10 border border-secondary-fixed-dim/20 px-6 py-2.5 rounded-full font-medium max-w-sm">
                {success.message}
              </p>
              
              <div className="mt-8 flex items-center justify-center gap-3 bg-secondary-fixed-dim text-primary-container rounded-full px-8 py-4 shadow-lg">
                <Coffee className="h-6 w-6 text-primary-container" />
                <span className="font-extrabold text-xl">{success.stamps} / 5 sellos</span>
              </div>
              <p className="mt-10 text-xs text-surface-variant/40 animate-pulse">Volviendo al panel...</p>
            </div>
          ) : selectedCustomer ? (
            <div className="bg-tertiary-container/40 backdrop-blur-xl border border-surface-variant/10 rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-8 animate-in fade-in duration-200">
              <div className="flex items-start justify-between border-b border-surface-variant/10 pb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary-fixed-dim">
                      Cliente Seleccionado
                    </span>
                    {!isEditing && (
                      <button onClick={startEdit} className="text-surface-variant/60 hover:text-secondary-fixed-dim transition-colors" title="Editar datos">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <form onSubmit={saveEdit} className="mt-4 space-y-4 max-w-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative pt-2">
                          <input className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-1 text-inverse-on-surface focus:ring-0 focus:border-secondary-fixed-dim placeholder-transparent text-sm" id="edit-name" placeholder="Nombre" required value={editData.fullName} onChange={e => setEditData({...editData, fullName: e.target.value})} />
                          <label className="absolute left-0 -top-2 text-surface-variant text-xs transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-secondary-fixed-dim" htmlFor="edit-name">Nombre</label>
                        </div>
                        <div className="relative pt-2">
                          <input className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-1 text-inverse-on-surface focus:ring-0 focus:border-secondary-fixed-dim placeholder-transparent text-sm" id="edit-dni" placeholder="DNI" required value={editData.dni} onChange={e => setEditData({...editData, dni: e.target.value})} />
                          <label className="absolute left-0 -top-2 text-surface-variant text-xs transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-secondary-fixed-dim" htmlFor="edit-dni">DNI</label>
                        </div>
                        <div className="relative pt-2">
                          <input className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-1 text-inverse-on-surface focus:ring-0 focus:border-secondary-fixed-dim placeholder-transparent text-sm" id="edit-phone" placeholder="Tel" required value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                          <label className="absolute left-0 -top-2 text-surface-variant text-xs transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-secondary-fixed-dim" htmlFor="edit-phone">Teléfono</label>
                        </div>
                        <div className="relative pt-2">
                          <input className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-1 text-inverse-on-surface focus:ring-0 focus:border-secondary-fixed-dim placeholder-transparent text-sm [color-scheme:dark]" type="date" id="edit-birth" placeholder="Nacimiento" required value={editData.birthDate} onChange={e => setEditData({...editData, birthDate: e.target.value})} />
                          <label className="absolute left-0 -top-2 text-surface-variant text-xs transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs peer-focus:text-secondary-fixed-dim" htmlFor="edit-birth">Nacimiento</label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button type="submit" loading={loading} className="h-8 text-xs">Guardar</Button>
                        <Button type="button" variant="ghost" className="h-8 text-xs" onClick={() => setIsEditing(false)}>Cancelar</Button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-inverse-on-surface mt-1">{selectedCustomer.full_name}</h2>
                      <div className="flex flex-wrap gap-4 text-xs text-surface-variant/60 mt-2 font-medium">
                        <p>DNI: <span className="text-inverse-on-surface font-bold">{selectedCustomer.dni || "—"}</span></p>
                        <p>Tel: <span className="text-inverse-on-surface font-bold">{selectedCustomer.phone || "—"}</span></p>
                        <p>Email: <span className="text-inverse-on-surface font-bold">{selectedCustomer.email || "—"}</span></p>
                        <p>Cumpleaños: <span className="text-inverse-on-surface font-bold">
                          {selectedCustomer.birth_date
                            ? new Date(selectedCustomer.birth_date + "T12:00:00").toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : "No registrado"}
                        </span></p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setDni("");
                    setCode("");
                    setError(null);
                    setIsEditing(false);
                  }}
                  className="p-2 hover:bg-surface-variant/10 rounded-lg text-surface-variant/40 hover:text-inverse-on-surface transition-all"
                  title="Deseleccionar cliente"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Birthday Banner */}
              {birthdayToday && (
                <div className="bg-secondary-fixed-dim/10 border-2 border-dashed border-secondary-fixed-dim/30 rounded-xl p-5 text-center text-secondary-fixed-dim animate-in fade-in duration-300">
                  <span className="text-3xl">🎉</span>
                  <h3 className="font-extrabold text-lg mt-1">¡Hoy es su cumpleaños!</h3>
                  <p className="text-xs opacity-80 mt-1 max-w-md mx-auto">
                    ¡Hazle un regalo especial de parte de PuntoCafé! (Ej. un café gratis de cortesía o suma un sello de regalo).
                  </p>
                </div>
              )}

              {/* Stamps Progress Bar */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-inverse-on-surface">
                  <span>Progreso de la Tarjeta</span>
                  <span className="bg-surface-variant/10 border border-surface-variant/10 text-secondary-fixed-dim px-3 py-1 rounded-full text-xs">
                    {selectedStamps}/5 sellos acumulados
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const active = idx < selectedStamps;
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 border ${
                          active
                            ? "border-secondary-fixed-dim bg-secondary-fixed-dim text-primary-container shadow-[0_4px_20px_rgba(214,196,171,0.2)] scale-105"
                            : "border-surface-variant/10 bg-surface-variant/5 text-surface-variant/20"
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
                <form onSubmit={addStamp} className="bg-surface-variant/5 rounded-xl p-5 border border-surface-variant/10 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-inverse-on-surface text-base mb-1 flex items-center gap-2">
                      <Plus className="h-4 w-4 text-secondary-fixed-dim" /> Sumar Sello
                    </h3>
                    <p className="text-xs text-surface-variant/60 mb-4">
                      Ingresa el código temporal de 4 dígitos generado en la app del cliente.
                    </p>
                    <div className="relative pt-2">
                      <input 
                        className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-2 text-center text-2xl tracking-[0.8em] font-mono text-inverse-on-surface focus:ring-0 focus:border-secondary-fixed-dim transition-colors placeholder-transparent" 
                        id="stamp-code" 
                        placeholder="----" 
                        required 
                        maxLength={4}
                        type="tel"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                  </div>
                  {error && (
                    <p className="mt-3 text-xs font-semibold text-red-400 bg-red-900/20 border border-red-500/20 p-2 rounded-lg text-center">
                      {error}
                    </p>
                  )}
                  <Button
                    className="mt-6 w-full h-12 text-sm bg-secondary-fixed-dim hover:bg-secondary-fixed-dim text-primary-container font-bold"
                    loading={loading}
                    type="submit"
                  >
                    Confirmar Sello
                  </Button>
                </form>

                {/* Redeem Form */}
                <div className={`rounded-xl p-5 border flex flex-col justify-between transition-colors ${
                  isRewardReady
                    ? "bg-secondary-fixed-dim/10 border-secondary-fixed-dim/30"
                    : "bg-surface-variant/5 border-surface-variant/10 opacity-70"
                }`}>
                  <div>
                    <h3 className="font-bold text-inverse-on-surface text-base mb-1 flex items-center gap-2">
                      <Gift className="h-4 w-4 text-secondary-fixed-dim" /> Canjear Café Gratis
                    </h3>
                    <p className="text-xs text-surface-variant/60">
                      Cuando el cliente alcanza los 5 sellos, puedes entregarle su café gratis y reiniciar la tarjeta.
                    </p>
                    {isRewardReady ? (
                      <div className="mt-4 flex items-center gap-2.5 text-secondary-fixed-dim bg-secondary-fixed-dim/10 px-4 py-3 rounded-lg border border-secondary-fixed-dim/20">
                        <Check className="h-5 w-5 stroke-[3px]" />
                        <span className="text-xs font-bold uppercase tracking-wider">¡El canje está disponible!</span>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center gap-2.5 text-surface-variant/40 bg-surface-variant/10 px-4 py-3 rounded-lg">
                        <X className="h-4 w-4" />
                        <span className="text-xs font-medium">Aún le faltan {5 - selectedStamps} sellos.</span>
                      </div>
                    )}
                  </div>
                  <Button
                    className={`mt-6 w-full h-12 text-sm font-bold ${
                      isRewardReady
                        ? "bg-inverse-on-surface hover:bg-surface-variant text-primary-container"
                        : "bg-surface-variant/10 text-surface-variant/40 cursor-not-allowed"
                    }`}
                    disabled={!isRewardReady}
                    loading={loading}
                    onClick={redeemReward}
                    variant={isRewardReady ? "primary" : "ghost"}
                  >
                    Entregar Café Gratis
                  </Button>
                </div>
              </div>

              {/* History */}
              <div className="border-t border-surface-variant/10 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-surface-variant/50 mb-4">
                  Historial de Movimientos
                </h3>
                {loadingHistory ? (
                  <p className="text-sm text-surface-variant/50 animate-pulse">Cargando historial...</p>
                ) : history.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {history.map((h) => {
                      const isStamp = h.type === "stamp_added";
                      return (
                        <div key={h.id} className="flex justify-between items-center text-xs p-3 rounded-lg bg-surface-variant/5 border border-surface-variant/10">
                          <div>
                            <p className="font-bold text-inverse-on-surface">
                              {isStamp ? "Sello Agregado" : "Recompensa Canjeada"}
                            </p>
                            <p className="text-[10px] text-surface-variant/50 mt-0.5">
                              {new Date(h.created_at).toLocaleString("es-AR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <span className={`font-bold px-2 py-1 rounded ${
                            isStamp ? "text-secondary-fixed-dim bg-secondary-fixed-dim/10 border border-secondary-fixed-dim/10" : "text-emerald-400 bg-emerald-400/10 border border-emerald-400/10"
                          }`}>
                            {h.stamps_before} → {h.stamps_after}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-surface-variant/50 italic bg-surface-variant/5 p-4 rounded-xl text-center">
                    Aún no hay movimientos registrados para este cliente.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Blank state: Quick operations form */
            <div className="bg-tertiary-container/40 backdrop-blur-xl border border-surface-variant/10 rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl font-bold text-inverse-on-surface mb-1">Carga Rápida de Sellos</h2>
                <p className="text-sm text-surface-variant/60">
                  Si tienes el DNI y código a mano, ingrésalos aquí directamente. O selecciona un cliente a la izquierda.
                </p>
              </div>

              <form onSubmit={addStamp} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="relative pt-2">
                    <input 
                      className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-2 text-inverse-on-surface font-body-md text-body-md focus:ring-0 focus:border-secondary-fixed-dim transition-colors placeholder-transparent" 
                      id="quick-dni" 
                      placeholder="DNI del Cliente" 
                      required 
                      type="tel"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                    />
                    <label className="absolute left-0 top-4 text-surface-variant font-body-md text-body-md cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-label-sm peer-focus:text-secondary-fixed-dim peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-label-sm peer-[:not(:placeholder-shown)]:text-surface-variant" htmlFor="quick-dni">
                      DNI del Cliente
                    </label>
                  </div>
                  <div className="relative pt-2">
                    <input 
                      className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-2 text-center tracking-[0.5em] font-mono text-inverse-on-surface font-body-md focus:ring-0 focus:border-secondary-fixed-dim transition-colors placeholder-transparent" 
                      id="quick-code" 
                      placeholder="Código" 
                      required 
                      maxLength={4}
                      type="tel"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    />
                    <label className="absolute left-0 top-4 text-surface-variant font-body-md text-body-md cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-label-sm peer-focus:text-secondary-fixed-dim peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-label-sm peer-[:not(:placeholder-shown)]:text-surface-variant" htmlFor="quick-code">
                      Código de 4 dígitos
                    </label>
                  </div>
                </div>

                {error && (
                  <p className="rounded-lg bg-red-900/20 border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400 text-center">
                    {error}
                  </p>
                )}

                <Button
                  className="w-full h-14 text-lg bg-secondary-fixed-dim hover:bg-secondary-fixed-dim text-primary-container font-bold"
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

