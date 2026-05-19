"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Camera,
  Check,
  Coffee,
  Gift,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRewardCopy, rewardGoal } from "@/lib/loyalty";
import type { Database, LoyaltyCustomer, LoyaltyEvent } from "@/types/database";

type Card = Database["public"]["Tables"]["loyalty_cards"]["Row"];
type Action = "stamps" | "redeem";

function getCard(customer: LoyaltyCustomer): Card | null {
  if (Array.isArray(customer.loyalty_cards)) {
    return customer.loyalty_cards[0] ?? null;
  }

  return customer.loyalty_cards;
}

function eventLabel(event: LoyaltyEvent) {
  return event.type === "stamp_added" ? "Sello agregado" : "Cafe canjeado";
}

export function AdminPanel() {
  const [pin, setPin] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<LoyaltyCustomer | null>(
    null,
  );
  const [events, setEvents] = useState<LoyaltyEvent[]>([]);
  const [historyEnabled, setHistoryEnabled] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (userId: string) => {
    const response = await fetch(`/api/admin/history?userId=${userId}`);
    const json = (await response.json()) as {
      events?: LoyaltyEvent[];
      historyEnabled?: boolean;
      error?: string;
    };

    if (response.ok) {
      setEvents(json.events ?? []);
      setHistoryEnabled(json.historyEnabled ?? true);
    }
  }, []);

  const loadCustomers = useCallback(
    async (search = query, options: { autoSelect?: boolean } = {}) => {
      setLoadingCustomers(true);
      setError(null);
      const response = await fetch(
        `/api/admin/customers?q=${encodeURIComponent(search.trim())}`,
      );

      if (response.status === 401) {
        setIsLogged(false);
        setLoadingCustomers(false);
        return [];
      }

      const json = (await response.json()) as {
        customers?: LoyaltyCustomer[];
        error?: string;
      };

      if (!response.ok) {
        setError(json.error ?? "No se pudieron cargar los clientes.");
        setLoadingCustomers(false);
        return [];
      }

      const nextCustomers = json.customers ?? [];
      setCustomers(nextCustomers);

      if (options.autoSelect && nextCustomers.length === 1) {
        setSelectedCustomer(nextCustomers[0]);
        await loadHistory(nextCustomers[0].id);
      }

      setLoadingCustomers(false);
      return nextCustomers;
    },
    [loadHistory, query],
  );

  useEffect(() => {
    if (isLogged) {
      void loadCustomers("");
    }
  }, [isLogged, loadCustomers]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });

    if (!response.ok) {
      setError("PIN invalido.");
      return;
    }

    setIsLogged(true);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLogged(false);
  };

  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadCustomers(query, { autoSelect: true });
  };

  const selectCustomer = async (customer: LoyaltyCustomer) => {
    setSelectedCustomer(customer);
    setNotice(null);
    setError(null);
    await loadHistory(customer.id);
  };

  const refreshSelected = async () => {
    if (!selectedCustomer) {
      await loadCustomers(query);
      return;
    }

    const results = await loadCustomers(selectedCustomer.id, { autoSelect: true });
    setSelectedCustomer(results[0] ?? selectedCustomer);
    await loadHistory(selectedCustomer.id);
  };

  const mutateCard = async (customer: LoyaltyCustomer, action: Action) => {
    const card = getCard(customer);

    if (!card) {
      setError("El cliente no tiene tarjeta activa.");
      return;
    }

    if (action === "redeem") {
      const confirmed = window.confirm(
        `Confirmar canje de cafe gratis para ${customer.full_name}?`,
      );

      if (!confirmed) {
        return;
      }
    }

    setBusyId(customer.id);
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/${action}`, {
      method: "POST",
      body: JSON.stringify({ userId: customer.id }),
    });
    const json = (await response.json()) as {
      card?: Card;
      message?: string;
      error?: string;
    };

    if (!response.ok) {
      setError(json.error ?? "No se pudo actualizar la tarjeta.");
      setBusyId(null);
      return;
    }

    setNotice(json.message ?? "Tarjeta actualizada.");
    const updatedCustomer: LoyaltyCustomer = {
      ...customer,
      loyalty_cards: json.card ? [json.card] : customer.loyalty_cards,
    };
    setSelectedCustomer(updatedCustomer);
    setCustomers((current) =>
      current.map((item) => (item.id === customer.id ? updatedCustomer : item)),
    );
    await loadHistory(customer.id);
    setBusyId(null);
  };

  const onQrResult = useCallback(
    async (text: string) => {
      try {
        const payload = JSON.parse(text) as { userId?: string };

        if (!payload.userId) {
          setError("QR no reconocido.");
          return;
        }

        setQuery(payload.userId);
        setScanOpen(false);
        setNotice("QR escaneado. Cliente listo para operar.");
        await loadCustomers(payload.userId, { autoSelect: true });
      } catch {
        setError("QR no reconocido.");
      }
    },
    [loadCustomers],
  );

  if (!isLogged) {
    return (
      <main className="grid min-h-dvh place-items-center px-4">
        <form
          onSubmit={login}
          className="glass-panel w-full max-w-sm rounded-lg p-6 shadow-soft"
        >
          <BrandMark />
          <h1 className="mt-8 text-2xl font-semibold text-espresso">
            Admin PuntoCafe
          </h1>
          <p className="mt-2 text-sm leading-6 text-espresso/60">
            Acceso privado para sumar sellos, escanear QR y canjear beneficios.
          </p>
          <div className="mt-6">
            <Input
              label="PIN administrador"
              type="password"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}
          <Button className="mt-6 w-full" type="submit">
            Entrar
          </Button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="flex items-center justify-between gap-4">
          <BrandMark />
          <Button onClick={logout} variant="ghost" className="h-10 px-3">
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </header>

        <section className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-5">
            <section className="glass-panel rounded-lg p-4 shadow-soft sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-caramel">
                    Mostrador
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold text-espresso">
                    Escanear o buscar
                  </h1>
                </div>
                {selectedCustomer ? (
                  <button
                    aria-label="Quitar cliente seleccionado"
                    className="grid h-10 w-10 place-items-center rounded-lg bg-espresso/8 text-espresso"
                    onClick={() => setSelectedCustomer(null)}
                    type="button"
                  >
                    <X className="h-5 w-5" />
                  </button>
                ) : null}
              </div>

              <form onSubmit={search} className="mt-5">
                <Input
                  label="Cliente"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Nombre, DNI, email, telefono o ID"
                />
              </form>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  onClick={() => loadCustomers(query, { autoSelect: true })}
                  variant="secondary"
                  loading={loadingCustomers}
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
                <Button onClick={() => setScanOpen((current) => !current)}>
                  <Camera className="h-4 w-4" />
                  Escanear
                </Button>
              </div>

              {scanOpen ? <QrScanner onResult={onQrResult} /> : null}
              {notice ? (
                <p className="mt-4 rounded-lg bg-caramel/12 px-4 py-3 text-sm font-medium text-espresso">
                  {notice}
                </p>
              ) : null}
              {error ? (
                <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              ) : null}
            </section>

            <section className="grid gap-3">
              {customers.map((customer) => (
                <CustomerRow
                  customer={customer}
                  key={customer.id}
                  selected={selectedCustomer?.id === customer.id}
                  onSelect={() => selectCustomer(customer)}
                />
              ))}
            </section>
          </div>

          <SelectedCustomerPanel
            busy={busyId === selectedCustomer?.id}
            customer={selectedCustomer}
            events={events}
            historyEnabled={historyEnabled}
            onAddStamp={(customer) => mutateCard(customer, "stamps")}
            onRedeem={(customer) => mutateCard(customer, "redeem")}
            onRefresh={refreshSelected}
          />
        </section>
      </div>
    </main>
  );
}

function CustomerRow({
  customer,
  onSelect,
  selected,
}: {
  customer: LoyaltyCustomer;
  onSelect: () => void;
  selected: boolean;
}) {
  const stamps = getCard(customer)?.stamps ?? 0;

  return (
    <button
      className={`glass-panel w-full rounded-lg p-4 text-left shadow-soft transition ${
        selected ? "ring-2 ring-caramel" : "hover:border-caramel/40"
      }`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-espresso">
            {customer.full_name}
          </h2>
          <p className="mt-1 truncate text-sm text-espresso/55">
            DNI {customer.dni ?? "sin DNI"} - {customer.phone ?? "Sin telefono"}
          </p>
        </div>
        <span className="rounded-lg bg-espresso px-3 py-2 text-sm font-semibold text-cream">
          {stamps}/5
        </span>
      </div>
    </button>
  );
}

function SelectedCustomerPanel({
  busy,
  customer,
  events,
  historyEnabled,
  onAddStamp,
  onRedeem,
  onRefresh,
}: {
  busy: boolean;
  customer: LoyaltyCustomer | null;
  events: LoyaltyEvent[];
  historyEnabled: boolean;
  onAddStamp: (customer: LoyaltyCustomer) => void;
  onRedeem: (customer: LoyaltyCustomer) => void;
  onRefresh: () => void;
}) {
  if (!customer) {
    return (
      <section className="glass-panel grid min-h-96 place-items-center rounded-lg p-6 text-center shadow-soft">
        <div className="max-w-sm">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-lg bg-caramel/16 text-caramel">
            <Camera className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-semibold text-espresso">
            Esperando cliente
          </h2>
          <p className="mt-3 text-sm leading-6 text-espresso/60">
            Escanea el QR del cliente o buscalo por DNI, email, telefono o nombre
            para operar su tarjeta.
          </p>
        </div>
      </section>
    );
  }

  const card = getCard(customer);
  const stamps = card?.stamps ?? 0;
  const canRedeem = stamps >= rewardGoal;

  return (
    <section className="glass-panel rounded-lg p-5 shadow-soft sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-caramel">
            Cliente activo
          </p>
          <h2 className="mt-2 truncate text-3xl font-semibold text-espresso">
            {customer.full_name}
          </h2>
          <p className="mt-2 truncate text-sm text-espresso/55">
            DNI {customer.dni ?? "sin DNI"} - {customer.phone ?? "Sin telefono"}
          </p>
        </div>
        <Button onClick={onRefresh} variant="ghost" className="h-10 px-3">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={`mt-6 rounded-lg p-4 ${
          canRedeem ? "bg-caramel text-espresso" : "bg-espresso text-cream"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">
              {canRedeem ? "Cafe gratis disponible" : "Progreso actual"}
            </p>
            <p className={`mt-1 text-sm ${canRedeem ? "text-espresso/70" : "text-cream/62"}`}>
              {getRewardCopy(stamps)}
            </p>
          </div>
          {canRedeem ? <Sparkles className="h-7 w-7" /> : <Gift className="h-7 w-7" />}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-2">
        {Array.from({ length: rewardGoal }).map((_, index) => (
          <div
            className={`grid aspect-square place-items-center rounded-lg border ${
              index < stamps
                ? "border-caramel bg-caramel text-espresso"
                : "border-espresso/10 bg-porcelain text-espresso/25"
            }`}
            key={index}
          >
            <Coffee className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button
          disabled={!card || stamps >= rewardGoal}
          loading={busy}
          onClick={() => onAddStamp(customer)}
          variant="secondary"
        >
          <Plus className="h-4 w-4" />
          Sumar sello
        </Button>
        <Button disabled={!canRedeem} loading={busy} onClick={() => onRedeem(customer)}>
          <Check className="h-4 w-4" />
          Canjear cafe
        </Button>
      </div>

      <div className="mt-7 border-t border-espresso/10 pt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-espresso/50">
            Historial
          </h3>
          {!historyEnabled ? (
            <span className="text-xs font-medium text-espresso/42">
              tabla pendiente
            </span>
          ) : null}
        </div>
        {events.length > 0 ? (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                className="flex items-center justify-between gap-3 rounded-lg bg-porcelain px-3 py-2"
                key={event.id}
              >
                <div>
                  <p className="text-sm font-medium text-espresso">
                    {eventLabel(event)}
                  </p>
                  <p className="text-xs text-espresso/50">
                    {new Date(event.created_at).toLocaleString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-espresso/62">
                  {event.stamps_before} {"->"} {event.stamps_after}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-porcelain px-3 py-3 text-sm text-espresso/55">
            Todavia no hay movimientos registrados.
          </p>
        )}
      </div>
    </section>
  );
}

function QrScanner({ onResult }: { onResult: (text: string) => void }) {
  const scannerId = useMemo(() => "puntocafe-reader", []);

  useEffect(() => {
    let scanner: import("html5-qrcode").Html5Qrcode | null = null;
    let mounted = true;

    const start = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (!mounted) {
        return;
      }

      scanner = new Html5Qrcode(scannerId);
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => onResult(decodedText),
        () => undefined,
      );
    };

    void start();

    return () => {
      mounted = false;
      void scanner?.stop().catch(() => undefined);
    };
  }, [onResult, scannerId]);

  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-espresso/10 bg-espresso/5 p-3">
      <div id={scannerId} className="min-h-72 w-full" />
    </div>
  );
}
