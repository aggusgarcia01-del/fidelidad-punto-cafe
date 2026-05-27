"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  ArrowLeft,
  QrCode,
} from "lucide-react";
import type { Database, LoyaltyCustomer, LoyaltyEvent } from "@/types/database";
import { QRScanner } from "@/components/admin/qr-scanner";

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

function formatDni(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length <= 8) {
    if (clean.length > 5) {
      return clean.replace(/^(\d{1,2})(\d{3})(\d{0,3})$/, (match, p1, p2, p3) => {
        return p3 ? `${p1}.${p2}.${p3}` : `${p1}.${p2}`;
      });
    } else if (clean.length > 2) {
      return clean.replace(/^(\d{1,2})(\d{0,3})$/, "$1.$2");
    }
  }
  return clean;
}

function FloatingInput({ id, label, type = "text", value, onChange, placeholder, required = false, className = "", inputClassName = "", maxLength }: { id: string; label: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; required?: boolean; className?: string; inputClassName?: string; maxLength?: number }) {
  return (
    <div className={`relative pt-2 ${className}`}>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-2 text-inverse-on-surface font-body-md text-body-md focus:ring-0 focus:border-secondary-fixed-dim transition-colors placeholder-transparent ${inputClassName}`}
      />
      <label
        htmlFor={id}
        className={`absolute left-0 top-4 text-surface-variant font-body-md text-body-md cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-label-sm peer-focus:font-label-sm peer-focus:text-secondary-fixed-dim peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-label-sm peer-[:not(:placeholder-shown)]:font-label-sm peer-[:not(:placeholder-shown)]:text-surface-variant ${type === 'date' ? '-top-2 text-label-sm font-label-sm peer-focus:text-secondary-fixed-dim' : ''}`}
      >
        {label}
      </label>
    </div>
  );
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

  // Creation states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createData, setCreateData] = useState({
    fullName: "",
    dni: "",
    email: "",
    phone: "",
    birthDate: ""
  });
  const [createError, setCreateError] = useState<string | null>(null);

  // QR scanner states
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Confirm redeem modal state
  const [isConfirmRedeemOpen, setIsConfirmRedeemOpen] = useState(false);

  // Audio state & logic for scanning / stamping success feedback
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

  const birthdayToday = selectedCustomer ? isBirthdayToday(selectedCustomer.birth_date) : false;

  useEffect(() => {
    fetch("/api/admin/customers?q=ping").then((res) => {
      if (res.ok) setIsLogged(true);
    });
  }, []);

  useEffect(() => {
    if (isLogged && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const scanToken = url.searchParams.get("scan");
      if (scanToken) {
        // Automatically process scan on load
        handleQrScanned(scanToken);
        url.searchParams.delete("scan");
        window.history.replaceState({}, "", url.toString());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogged]);

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
    setDni(formatDni(customer.dni || ""));
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
      dni: formatDni(selectedCustomer?.dni || ""),
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
          dni: editData.dni.replace(/\D/g, ""),
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
        dni: editData.dni.replace(/\D/g, ""),
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
    ensureAudioContext();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/add-stamp", {
        method: "POST",
        body: JSON.stringify({ dni: dni.replace(/\D/g, ""), code }),
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
      playSuccessSound();
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

  const redeemReward = () => {
    if (!selectedCustomer) return;
    setIsConfirmRedeemOpen(true);
  };

  const executeRedeem = async () => {
    if (!selectedCustomer) return;
    ensureAudioContext();
    setIsConfirmRedeemOpen(false);
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
      playRedeemSound();
      setTimeout(() => triggerConfetti(), 100);

      void loadCustomers(searchQuery);
      if (json.card) {
        const updatedCustomer = { ...selectedCustomer, loyalty_cards: [json.card] };
        setSelectedCustomer(updatedCustomer);
        selectCustomer(updatedCustomer);
      }

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch {
      setError("Error de red al canjear la recompensa.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    void loadCustomers(val);
  };

  // Create customer submission
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCreateError(null);

    try {
      const response = await fetch("/api/admin/create-customer", {
        method: "POST",
        body: JSON.stringify({
          fullName: createData.fullName,
          dni: createData.dni.replace(/\D/g, ""),
          email: createData.email,
          phone: createData.phone,
          birthDate: createData.birthDate
        })
      });

      const json = await response.json();

      if (!response.ok) {
        setCreateError(json.error || "No se pudo crear el cliente.");
        return;
      }

      // Success
      void loadCustomers(searchQuery);
      if (json.customer) {
        selectCustomer(json.customer);
      }
      setCreateData({ fullName: "", dni: "", email: "", phone: "", birthDate: "" });
      setIsCreateModalOpen(false);
    } catch {
      setCreateError("Error de conexión al registrar cliente.");
    } finally {
      setLoading(false);
    }
  };

  // QR Scanner logics
  const handleQrScanned = async (text: string) => {
    let scanToken = text;
    try {
      if (text.startsWith("http")) {
        const url = new URL(text);
        const urlParam = url.searchParams.get("scan");
        if (urlParam) scanToken = urlParam;
      }
    } catch {
      // Ignorar error de URL
    }

    // Check if it looks like a JWT token (QRToken)
    if (scanToken.split('.').length === 3) {
      setIsQrModalOpen(false);
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/add-stamp", {
          method: "POST",
          body: JSON.stringify({ qrToken: scanToken }),
        });
        const json = await response.json();
        
        if (!response.ok) {
          setError(json.error || "No se pudo agregar el sello via QR.");
          return;
        }

        setSuccess({
          customerName: json.customerName || "Cliente (QR)",
          stamps: json.stamps,
          message: json.message
        });
        playSuccessSound();

        // Refresh UI
        void loadCustomers(searchQuery);
        
        setTimeout(() => setSuccess(null), 3000);
      } catch {
        setError("Error de red al procesar el QR.");
      } finally {
        setLoading(false);
      }
    } else {
      // old format fallback
      try {
        const data = JSON.parse(scanToken);
        if (data.dni && data.code) {
          setDni(formatDni(data.dni));
          setCode(data.code);
          setIsQrModalOpen(false);

          const rawDni = data.dni.replace(/\D/g, "");
          const found = customers.find(c => c.dni === rawDni);
          if (found) {
            selectCustomer(found);
          }
        }
      } catch {
        console.error("Formato de QR no reconocido:", text);
      }
    }
  };

  if (!isLogged) {
    return (
      <main className="grid min-h-screen place-items-center px-4 relative flex-1">
        <form
          onSubmit={login}
          className="bg-tertiary-container/40 backdrop-blur-xl border border-surface-variant/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full max-w-sm rounded-2xl p-8 z-10 animate-scale-in"
        >
          <div className="flex justify-center mb-8">
            <BrandMark />
          </div>
          <h1 className="text-2xl font-bold text-center text-inverse-on-surface">
            Acceso Barista
          </h1>
          <p className="mt-2 text-sm text-center text-surface-variant/80 mb-8">
            Ingresa el PIN de seguridad de la sucursal.
          </p>
          <div className="mb-8">
            <FloatingInput
              id="pin"
              label="PIN de seguridad"
              type="password"
              placeholder="PIN"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              inputClassName="text-center text-2xl tracking-[0.5em]"
            />
          </div>
          {error && (
            <p className="mb-6 rounded-xl bg-error-container/30 border border-error/30 px-4 py-3 text-sm font-medium text-error text-center">
              {error}
            </p>
          )}
          <button className="w-full bg-inverse-on-surface text-primary-container font-label-md py-4 rounded-full flex items-center justify-center gap-2 hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_25px_rgba(214,196,171,0.2)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50" disabled={loading} type="submit">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  const selectedStamps = selectedCustomer ? (getCard(selectedCustomer)?.stamps ?? 0) : 0;
  const isRewardReady = selectedStamps >= 5;

  return (
    <div className="flex-1 flex flex-col h-screen animate-fade-in">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandMark />
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-brand-accent tracking-wider">
            PANEL BARISTA ACTIVO
          </div>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-y-auto md:overflow-hidden p-4 md:p-6 gap-6 max-w-[1600px] mx-auto w-full flex-col md:flex-row">
        
        {/* Left Sidebar (Client List) */}
        <aside className={`w-full md:w-[350px] flex flex-col gap-4 h-auto md:h-full ${selectedCustomer ? 'hidden md:flex' : 'flex'} order-2 md:order-1`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Clientes Registrados</h2>
              <p className="text-sm text-gray-400">Busca y selecciona un cliente</p>
            </div>
            <button
              onClick={() => {
                setCreateError(null);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-accent text-black font-bold text-xs hover:bg-brand-accent/90 transition-all active:scale-95 shadow-md shadow-brand-accent/10 mt-1"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3px]" /> Nuevo
            </button>
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              id="search"
              type="text"
              placeholder="Buscar por Nombre, DNI, Email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="premium-input w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all"
            />
          </div>
          <div className="h-auto md:flex-1 overflow-visible md:overflow-y-auto pr-2 mt-2 space-y-3">
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
                        <p className={`text-xs mt-1 ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>DNI: {formatDni(c.dni || "Sin DNI")}</p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 ${isSelected ? 'bg-brand-accent/10 text-brand-accent' : stampsCount >= 5 ? 'bg-brand-accent/20 text-brand-accent border border-brand-accent/30' : 'bg-white/5 text-gray-400'}`}>
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
        <section className={`w-full md:flex-1 flex flex-col gap-6 overflow-visible md:overflow-y-auto pr-1 order-1 md:order-2`}>
          
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
              <div className="md:hidden animate-fade-in">
                <button onClick={() => { setSelectedCustomer(null); setDni(""); setCode(""); setIsEditing(false); }} className="flex items-center gap-2 text-sm text-brand-accent font-semibold bg-brand-accent/10 border border-brand-accent/20 px-4 py-2.5 rounded-xl w-full justify-center mb-4 active:scale-95 transition-transform">
                  <ArrowLeft className="h-4 w-4" /> Volver a la lista
                </button>
              </div>

              {/* Top Section: Client Details & Stamp Progress */}
              <div className="glass-panel rounded-2xl p-8 relative">
                <button onClick={() => { setSelectedCustomer(null); setDni(""); setCode(""); setIsEditing(false); }} className="hidden md:block absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
                <div className="mb-8 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Cliente Seleccionado</div>
                    {!isEditing && <button onClick={startEdit} className="text-gray-500 hover:text-brand-accent transition-colors"><Edit2 className="h-3 w-3" /></button>}
                  </div>
                  
                  {isEditing ? (
                    <form onSubmit={saveEdit} className="mt-4 space-y-6 max-w-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <FloatingInput id="editFullName" label="Nombre Completo" value={editData.fullName} onChange={(e)=>setEditData({...editData, fullName: e.target.value})} required />
                            <FloatingInput id="editDni" label="DNI" value={editData.dni} onChange={(e)=>setEditData({...editData, dni: formatDni(e.target.value)})} required />
                            <FloatingInput id="editPhone" label="Teléfono" value={editData.phone} onChange={(e)=>setEditData({...editData, phone: e.target.value})} required />
                            <FloatingInput id="editBirthDate" label="Fecha de Nacimiento" type="date" value={editData.birthDate} onChange={(e)=>setEditData({...editData, birthDate: e.target.value})} required />
                        </div>
                        <div className="flex gap-4 pt-2">
                            <button type="submit" disabled={loading} className="flex-1 bg-brand-accent text-black font-label-md py-3 rounded-full hover:bg-brand-accent/90 transition-all duration-300 disabled:opacity-50">Guardar Cambios</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="flex-1 font-label-md py-3 rounded-full border border-surface-variant/30 text-surface-variant hover:text-white hover:bg-white/5 transition-all duration-300">Cancelar</button>
                        </div>
                    </form>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-white mb-4">{selectedCustomer.full_name}</h2>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                        <span className="flex items-center gap-2"><span className="text-gray-500">DNI:</span> {formatDni(selectedCustomer.dni || "—")}</span>
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
                  
                  {/* Stamps Row mimicking client view */}
                  <div className="flex items-center justify-between pt-4 pb-8 w-full">
                    {[0, 1, 2, 3, 4].map(idx => {
                        const active = idx < selectedStamps;
                        const isGift = idx === 4;
                        return (
                            <div key={idx} className="flex items-center flex-1 last:flex-none relative">
                                <div className="relative flex justify-center items-center">
                                    <div className={`stamp-circle ${active ? 'active scale-105' : ''} ${isGift && !active ? 'gift' : ''} overflow-hidden border-none w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 min-[390px]:w-12 min-[390px]:h-12 min-[420px]:w-14 min-[420px]:h-14 sm:w-[72px] sm:h-[72px] flex-shrink-0`}>
                                        <img 
                                          alt="Punto Café Premium Logo" 
                                          className={`w-full h-full object-cover ${!active ? 'opacity-20' : ''}`} 
                                          src="/logo-gold.png"
                                        />
                                    </div>
                                    <span className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 text-[8px] min-[360px]:text-[10px] text-gray-500 font-medium select-none whitespace-nowrap">
                                      SELLO {idx + 1}
                                    </span>
                                </div>
                                {idx < 4 && <div className="h-[1px] flex-grow min-w-[4px] max-w-[48px] bg-white/10 mx-1 sm:mx-4"></div>}
                            </div>
                        );
                    })}
                  </div>
                </div>
              </div>

              {/* Middle Section: Actions (Add Stamp & Redeem) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Add Stamp Card */}
                <form onSubmit={addStamp} className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                      <Plus className="h-4 w-4 text-brand-accent" /> <span className="text-brand-accent">Sumar sello</span>
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
                  <button type="submit" disabled={loading} className="w-full bg-brand-accent hover:bg-brand-accent/90 text-black py-3.5 rounded-xl font-semibold text-sm transition-all shadow-[0_0_15px_rgba(214,196,171,0.2)] hover:shadow-[0_0_25px_rgba(214,196,171,0.4)] disabled:opacity-50">
                    Confirmar Sello
                  </button>
                </form>

                {/* Redeem Coffee Card */}
                <div className={`glass-panel rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden ${!isRewardReady ? 'opacity-50' : ''}`}>
                  {!isRewardReady && <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none"></div>}
                  <div className="relative z-20">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                      <Gift className="h-4 w-4 text-gray-400" /> Canjear café gratis
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
                      <div key={h.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 animate-fade-in">
                        <div>
                          <p className="font-semibold text-white text-sm">{h.type === 'stamp_added' ? 'Sello Agregado' : 'Canje de Recompensa'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(h.created_at).toLocaleString('es-AR', {
                              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                              timeZone: 'America/Argentina/Buenos_Aires'
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
            <div className="glass-panel rounded-2xl p-8 animate-scale-in flex flex-col justify-center min-h-[500px]">
               
               {/* BIG PRIMARY QR SCAN BUTTON */}
               <div className="mb-12 pb-8">
                 <h2 className="text-3xl font-bold text-white mb-3 text-center">Escanear QR de Cliente</h2>
                 <p className="text-sm text-gray-400 text-center mb-8">Pide al cliente que abra su app y muestra el código frente a la cámara.</p>
                 <button
                   type="button"
                   onClick={() => {
                     ensureAudioContext();
                     setIsQrModalOpen(true);
                   }}
                   className="w-full max-w-md mx-auto h-24 rounded-2xl btn-glow font-black text-xl flex items-center justify-center gap-4 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                 >
                   <QrCode className="h-10 w-10 stroke-[2.5px]" />
                   INICIAR ESCÁNER
                 </button>
               </div>

               <div className="flex flex-col items-center">
                 <div className="w-full max-w-md border-t border-white/5 pt-8">
                   <h3 className="text-lg font-bold text-white mb-2 text-center">Carga Manual</h3>
                   <p className="text-xs text-gray-500 mb-6 text-center">
                      Si la cámara no funciona, ingresa el DNI y código manualmente.
                   </p>
                   <form onSubmit={addStamp} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                         <div className="relative">
                           <FloatingInput
                              id="quickDni"
                              label="DNI del Cliente"
                              type="tel"
                              placeholder="DNI"
                              required
                              value={dni}
                              onChange={(e) => setDni(formatDni(e.target.value))}
                           />
                         </div>
                         <div className="relative">
                           <FloatingInput
                              id="quickCode"
                              label="Cód. 4 dígitos"
                              type="tel"
                              placeholder="----"
                              required
                              maxLength={4}
                              value={code}
                              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                              inputClassName="text-center tracking-[0.5em] font-mono text-xl"
                           />
                         </div>
                      </div>
                      {error && <p className="text-error text-xs bg-error-container/20 p-3 rounded-xl border border-error/20 text-center">{error}</p>}
                      <button type="submit" disabled={loading} className="w-full bg-white/5 border border-white/10 text-white font-label-md py-4 rounded-full flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-300 disabled:opacity-50">
                         Confirmar Sello Manual
                      </button>
                   </form>
                 </div>
               </div>
            </div>
          )}
        </section>
      </main>

      {/* Registrar Cliente Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleCreateCustomer}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#121212] p-6 text-left shadow-2xl animate-scale-in space-y-4"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Title */}
            <div>
              <h3 className="text-lg font-bold text-white">Registrar Nuevo Cliente</h3>
              <p className="text-xs text-gray-400">Crea una cuenta para un cliente en caja.</p>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-6">
              <FloatingInput id="createFullName" label="Nombre Completo *" value={createData.fullName} onChange={(e) => setCreateData({ ...createData, fullName: e.target.value })} required />
              <FloatingInput id="createDni" label="DNI del Cliente *" type="tel" value={createData.dni} onChange={(e) => setCreateData({ ...createData, dni: formatDni(e.target.value) })} required />
              <FloatingInput id="createEmail" label="Correo Electrónico (Opcional)" type="email" value={createData.email} onChange={(e) => setCreateData({ ...createData, email: e.target.value })} />
              <FloatingInput id="createPhone" label="Teléfono (Opcional)" type="tel" value={createData.phone} onChange={(e) => setCreateData({ ...createData, phone: e.target.value })} />
              <FloatingInput id="createBirthDate" label="Fecha de Nacimiento (Opcional)" type="date" value={createData.birthDate} onChange={(e) => setCreateData({ ...createData, birthDate: e.target.value })} />
            </div>

            {createError && (
              <p className="text-xs text-error bg-error-container/20 p-2.5 border border-error/20 rounded-xl text-center">
                {createError}
              </p>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 font-label-md py-3 rounded-full border border-surface-variant/30 text-surface-variant hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-inverse-on-surface text-primary-container font-label-md py-3 rounded-full hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.05)] disabled:opacity-50"
              >
                {loading ? "Creando..." : "Crear Cliente"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QR Scanner Modal */}
      {isQrModalOpen && (
        <QRScanner 
          onScan={handleQrScanned} 
          onClose={() => setIsQrModalOpen(false)} 
        />
      )}

      {/* Confirmar Canje Modal */}
      {isConfirmRedeemOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#121212] p-6 text-center shadow-2xl animate-scale-in space-y-6"
          >
            <div className="mx-auto h-16 w-16 rounded-full bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center">
              <Gift className="h-8 w-8 text-brand-accent animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">¿Confirmar Canje?</h3>
              <p className="text-sm text-gray-400">
                Se canjeará el café de regalo para <strong className="text-white">{selectedCustomer.full_name}</strong>. Esta acción reiniciará su acumulador de sellos a 0.
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmRedeemOpen(false)}
                className="flex-1 font-label-md py-3 rounded-full border border-surface-variant/30 text-surface-variant hover:text-white hover:bg-white/5 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeRedeem}
                disabled={loading}
                className="flex-1 bg-brand-accent text-black font-bold font-label-md py-3 rounded-full hover:bg-brand-accent/90 transition-all duration-300 shadow-[0_4px_20px_rgba(214,196,171,0.2)] disabled:opacity-50"
              >
                {loading ? "Procesando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Canvas for native confetti animation */}
      <canvas id="confetti-canvas" className="pointer-events-none fixed inset-0 z-[110] w-full h-full" />
    </div>
  );
}
