"use client";

import { useState, useEffect, useCallback } from "react";
import { BrandMark } from "@/components/brand-mark";
import {
  Coffee,
  CheckCircle,
  LogOut,
  Search,
  Plus,
  Check,
  Gift,
  X,
  Edit2,
  ArrowLeft
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
      <main className="grid min-h-screen place-items-center px-4 relative flex-1">
        <form
          onSubmit={login}
          className="glass-panel w-full max-w-sm rounded-2xl p-8 z-10"
        >
          <div className="flex justify-center mb-8">
            <BrandMark />
          </div>
          <h1 className="text-2xl font-bold text-center text-white">
            Acceso Barista
          </h1>
          <p className="mt-2 text-sm text-center text-gray-400 mb-8">
            Ingresa el PIN de seguridad de la sucursal.
          </p>
          <div className="mb-6">
            <input 
              className="premium-input w-full text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-xl" 
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
            <p className="mb-6 rounded-xl bg-red-900/30 border border-red-500/30 px-4 py-3 text-sm font-medium text-red-400 text-center">
              {error}
            </p>
          )}
          <button className="w-full h-12 text-sm font-bold btn-glow rounded-xl" disabled={loading} type="submit">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  const selectedStamps = selectedCustomer ? (getCard(selectedCustomer)?.stamps ?? 0) : 0;
  const isRewardReady = selectedStamps >= 5;

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandMark />
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-semibold text-brand-accent tracking-wider">
            PANEL BARISTA ACTIVO
          </div>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden p-4 md:p-6 gap-6 max-w-[1600px] mx-auto w-full flex-col md:flex-row">
        
        {/* Left Sidebar (Client List) */}
        <aside className={`w-full md:w-[350px] flex-col gap-4 ${selectedCustomer ? 'hidden md:flex' : 'flex'}`}>
          <div className="mb-2">
            <h2 className="text-xl font-bold text-white mb-1">Clientes Registrados</h2>
            <p className="text-sm text-gray-400">Busca y selecciona un cliente de la lista</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              className="premium-input w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all" 
              placeholder="Buscar por Nombre, DNI, Email..." 
              type="text" 
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex-1 overflow-y-auto pr-2 mt-2 space-y-3">
            {customers.length > 0 ? (
              customers.map((c) => {
                const card = getCard(c);
                const stampsCount = card?.stamps ?? 0;
                const isSelected = selectedCustomer?.id === c.id;

                return (
                  <div key={c.id} onClick={() => selectCustomer(c)} className={`glass-card rounded-xl p-4 cursor-pointer ${isSelected ? "border-brand-accent/30 bg-brand-accent/5 opacity-100" : "opacity-70"}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold text-base ${isSelected ? 'text-white' : 'text-gray-200'}`}>{c.full_name}</h3>
                        <p className={`text-xs mt-1 ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>DNI: {c.dni || "Sin DNI"}</p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 ${isSelected ? 'bg-white/10 text-brand-accent' : stampsCount >= 5 ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/30' : 'bg-white/5 text-gray-400'}`}>
                        <Coffee className={`h-3 w-3 ${isSelected || stampsCount >= 5 ? 'text-brand-accent' : ''}`} /> {stampsCount}/5
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No se encontraron clientes.</p>
            )}
          </div>
        </aside>

        {/* Main Workspace */}
        <section className={`flex-1 flex-col gap-6 overflow-y-auto pr-1 md:flex ${selectedCustomer ? 'flex' : 'flex'}`}>
          
          {/* Toast Notification */}
          {success && (
            <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="glass-panel border-brand-accent/30 shadow-[0_8px_32px_rgba(212,175,55,0.2)] rounded-2xl p-4 flex items-start gap-4 max-w-sm">
                <div className="h-10 w-10 rounded-full bg-brand-accent/20 flex-shrink-0 flex items-center justify-center border border-brand-accent/30">
                  <CheckCircle className="h-5 w-5 text-brand-accent" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{success.customerName}</h4>
                  <p className="text-xs text-brand-accent font-medium mt-0.5">{success.message}</p>
                  <div className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
                    <Coffee className="h-3 w-3" /> {success.stamps}/5 sellos
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCustomer ? (
            <>
              {/* Mobile Back Button */}
              <div className="md:hidden">
                <button onClick={() => { setSelectedCustomer(null); setDni(""); setCode(""); setIsEditing(false); }} className="flex items-center gap-2 text-sm text-brand-accent font-semibold bg-brand-accent/10 border border-brand-accent/20 px-4 py-2.5 rounded-xl w-full justify-center mb-4 active:scale-95 transition-transform">
                  <ArrowLeft className="h-4 w-4" /> Volver a la lista
                </button>
              </div>

              {/* Top Section: Client Details & Stamp Progress */}
              <div className="glass-panel rounded-2xl p-6 sm:p-8 relative">
                <button onClick={() => { setSelectedCustomer(null); setDni(""); setCode(""); setIsEditing(false); }} className="hidden md:block absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
                <div className="mb-8 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Cliente Seleccionado</div>
                    {!isEditing && <button onClick={startEdit} className="text-gray-500 hover:text-brand-accent transition-colors"><Edit2 className="h-3 w-3" /></button>}
                  </div>
                  
                  {isEditing ? (
                    <form onSubmit={saveEdit} className="mt-2 space-y-4 max-w-md">
                        <div className="grid grid-cols-2 gap-4">
                            <input className="premium-input w-full px-4 py-2 rounded-xl text-sm" placeholder="Nombre" value={editData.fullName} onChange={e=>setEditData({...editData, fullName: e.target.value})} required />
                            <input className="premium-input w-full px-4 py-2 rounded-xl text-sm" placeholder="DNI" value={editData.dni} onChange={e=>setEditData({...editData, dni: e.target.value})} required />
                            <input className="premium-input w-full px-4 py-2 rounded-xl text-sm" placeholder="Teléfono" value={editData.phone} onChange={e=>setEditData({...editData, phone: e.target.value})} required />
                            <input className="premium-input w-full px-4 py-2 rounded-xl text-sm [color-scheme:dark]" type="date" value={editData.birthDate} onChange={e=>setEditData({...editData, birthDate: e.target.value})} required />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" disabled={loading} className="px-4 py-2 btn-glow rounded-xl text-sm font-bold disabled:opacity-50">Guardar</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancelar</button>
                        </div>
                    </form>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-white mb-4">{selectedCustomer.full_name}</h2>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                        <span className="flex items-center gap-2"><span className="text-gray-500">DNI:</span> {selectedCustomer.dni || "—"}</span>
                        <span className="flex items-center gap-2"><span className="text-gray-500">Tel:</span> {selectedCustomer.phone || "—"}</span>
                        <span className="flex items-center gap-2"><span className="text-gray-500">Email:</span> {selectedCustomer.email || "—"}</span>
                        <span className="flex items-center gap-2"><span className="text-gray-500">Cumpleaños:</span> {selectedCustomer.birth_date ? new Date(selectedCustomer.birth_date + "T12:00:00").toLocaleDateString("es-AR") : "No registrado"}</span>
                      </div>
                    </>
                  )}
                </div>

                {birthdayToday && (
                  <div className="bg-brand-accent/10 border border-brand-accent/30 rounded-xl p-4 mb-8 text-center text-brand-accent flex items-center justify-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <h3 className="font-bold text-sm">¡Hoy es su cumpleaños!</h3>
                      <p className="text-xs opacity-80">Ideal para un regalo o un saludo especial.</p>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Progreso de la Tarjeta</h3>
                    <div className="px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-xs font-medium text-brand-accent">
                      {selectedStamps}/5 sellos acumulados
                    </div>
                  </div>
                  
                  {/* Stamps Row */}
                  <div className="flex items-center justify-center py-4">
                    {[0, 1, 2, 3, 4].map(idx => {
                        const active = idx < selectedStamps;
                        const isGift = idx === 4;
                        return (
                            <div key={idx} className="flex items-center">
                                <div className="flex flex-col items-center gap-2">
                                  <div className={`stamp-circle ${active ? 'active scale-105' : ''} ${isGift && !active ? 'gift' : ''}`}>
                                      {isGift ? <Gift className="h-5 w-5" /> : <Coffee className="h-5 w-5" />}
                                  </div>
                                  <span className="text-[10px] text-gray-500 font-medium">TAZA {idx + 1}</span>
                                </div>
                                {idx < 4 && <div className="h-[1px] w-4 sm:w-8 md:w-12 bg-white/10 mb-6 mx-2 sm:mx-4"></div>}
                            </div>
                        );
                    })}
                  </div>
                </div>
              </div>

              {/* Middle Section: Actions (Add Stamp & Redeem) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Add Stamp Card */}
                <form onSubmit={addStamp} className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                      <Plus className="h-4 w-4 text-gray-400" /> Sumar Sello
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">Ingresa el código temporal de 4 dígitos generado en la app del cliente.</p>
                    <div className="mb-6">
                      <label className="block text-xs font-medium text-gray-500 mb-2">Código Rotativo</label>
                      <div className="flex items-center premium-input rounded-xl px-4 py-3 h-12">
                        <input 
                          className="bg-transparent border-none outline-none w-full text-center text-xl tracking-[1em] text-white placeholder-gray-600 focus:ring-0 p-0" 
                          maxLength={4} 
                          placeholder="- - - -" 
                          type="tel"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                    </div>
                  </div>
                  {error && <p className="mb-4 text-xs text-red-400 text-center">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full btn-glow py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50">
                    Confirmar Sello
                  </button>
                </form>

                {/* Redeem Coffee Card */}
                <div className={`glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden ${!isRewardReady ? 'opacity-60' : ''}`}>
                  {!isRewardReady && <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none"></div>}
                  <div className="relative z-20">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                      <Gift className="h-4 w-4 text-gray-400" /> Canjear Café Gratis
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">Cuando el cliente alcanza los 5 sellos, puedes entregarle su café gratis y reiniciar la tarjeta.</p>
                    <div className="mb-6">
                      {isRewardReady ? (
                        <div className="flex items-center justify-center gap-2 bg-brand-accent/10 border border-brand-accent/20 rounded-xl px-4 py-3 h-12 text-sm text-brand-accent font-bold">
                          <Check className="h-4 w-4 stroke-[3px]" /> ¡El canje está disponible!
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/5 rounded-xl px-4 py-3 h-12 text-sm text-gray-500">
                          <X className="h-3 w-3" /> Aún le faltan {5 - selectedStamps} sellos.
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={redeemReward}
                    disabled={!isRewardReady || loading}
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm relative z-20 transition-all ${
                      isRewardReady 
                        ? 'btn-glow' 
                        : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Entregar Café Gratis
                  </button>
                </div>
              </div>

              {/* Bottom Section: History */}
              <div className="mt-4">
                <h3 className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-4 px-2">Historial de Movimientos</h3>
                {loadingHistory ? (
                  <div className="glass-panel rounded-2xl p-8 flex items-center justify-center border-dashed border-white/10">
                    <p className="text-sm text-gray-500 italic animate-pulse">Cargando...</p>
                  </div>
                ) : history.length > 0 ? (
                  <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {history.map(h => (
                      <div key={h.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <div>
                          <p className="font-semibold text-white text-sm">{h.type === 'stamp_added' ? 'Sello Agregado' : 'Canje de Recompensa'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(h.created_at).toLocaleString('es-AR', {
                              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className="font-mono text-sm text-gray-400 bg-black/40 px-3 py-1 rounded-lg border border-white/5">
                          {h.stamps_before} → {h.stamps_after}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel rounded-2xl p-8 flex items-center justify-center border-dashed border-white/10">
                    <p className="text-sm text-gray-500 italic">Aún no hay movimientos registrados para este cliente.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Blank state: Quick operations form */
            <div className="glass-panel rounded-2xl p-8">
               <h2 className="text-2xl font-bold text-white mb-2">Carga Rápida de Sellos</h2>
               <p className="text-sm text-gray-400 mb-8 max-w-lg">
                  Si tienes el DNI y código a mano, ingrésalos aquí directamente. O busca y selecciona un cliente de la lista.
               </p>
               <form onSubmit={addStamp} className="space-y-6 max-w-lg">
                  <div className="grid gap-6 sm:grid-cols-2">
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">DNI del Cliente</label>
                        <input 
                           className="premium-input w-full px-4 py-3 rounded-xl text-sm" 
                           placeholder="Ej. 12345678" 
                           required 
                           type="tel"
                           value={dni}
                           onChange={(e) => setDni(e.target.value)}
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">Código de 4 dígitos</label>
                        <input 
                           className="premium-input w-full px-4 py-3 rounded-xl text-center tracking-[0.5em] font-mono text-xl" 
                           placeholder="----" 
                           required 
                           maxLength={4}
                           type="tel"
                           value={code}
                           onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        />
                     </div>
                  </div>
                  {error && <p className="text-red-400 text-xs bg-red-900/20 p-3 rounded-xl border border-red-500/20 text-center">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full btn-glow py-3.5 rounded-xl font-bold text-sm">
                     Confirmar Sello
                  </button>
               </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
