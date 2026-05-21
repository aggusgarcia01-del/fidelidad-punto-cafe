"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ArrowRight, Sparkles } from "lucide-react";

function FloatingInput({ id, label, type = "text", value, onChange, placeholder, required = false, className = "", inputClassName = "", maxLength, inputMode }: { id: string; label: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; required?: boolean; className?: string; inputClassName?: string; maxLength?: number; inputMode?: "text" | "none" | "tel" | "url" | "email" | "numeric" | "decimal" | "search" }) {
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
        inputMode={inputMode}
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

type Mode = "dni" | "email";

export function MagicLinkForm() {
  const [step, setStep] = useState<"dni" | "register">("dni");
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetFeedback = () => {
    setError(null);
  };

  const formatDni = (val: string) => {
    const raw = val.replace(/\D/g, "");
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    setDni(formatDni(raw));
  };

  const checkDniAndLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    resetFeedback();

    const cleanDni = dni.replace(/\D/g, "");

    try {
      const response = await fetch("/api/auth/dni-login", {
        method: "POST",
        body: JSON.stringify({ dni: cleanDni }),
      });
      
      const json = await response.json().catch(() => null) as { error?: string, message?: string } | null;

      if (response.status === 404 && json?.error === "USER_NOT_FOUND") {
        setStep("register");
        return;
      }

      if (!response.ok || !json) {
        setError(json?.message ?? json?.error ?? "Error al intentar iniciar sesión.");
        return;
      }

      window.location.href = "/dashboard";
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Error de conexión.",
      );
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    resetFeedback();

    const cleanDni = dni.replace(/\D/g, "");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dni: cleanDni,
          full_name: fullName,
          phone,
          email,
          birth_date: birthDate
        }),
      });
      
      const json = await response.json().catch(() => null) as { error?: string } | null;

      if (!response.ok || !json) {
        setError(json?.error ?? "Error al registrar el usuario.");
        setLoading(false);
        return;
      }

      window.location.href = "/dashboard";
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Error al registrarse.",
      );
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-md relative group perspective-1000">
      {/* Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-to-br from-secondary-fixed-dim/20 to-transparent rounded-xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
      
      <div className="relative bg-tertiary-container/40 backdrop-blur-xl border border-surface-variant/10 rounded-xl p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

        {step === "dni" ? (
          <form className="flex flex-col gap-6" onSubmit={checkDniAndLogin}>
            <div className="text-center mb-2">
              <h2 className="text-xl font-headline-md text-surface-variant font-bold mb-2">Ingresá tu DNI</h2>
              <p className="text-surface-variant/60 text-sm">Si sos nuevo, te pediremos unos datos más en el próximo paso.</p>
            </div>
            
            <FloatingInput
              id="dni-login"
              label="DNI"
              type="text"
              placeholder="DNI"
              required
              inputMode="numeric"
              value={dni}
              onChange={handleDniChange}
              inputClassName="tracking-widest text-center text-xl"
            />

            <Feedback message={null} error={error} />

            <button 
              className="w-full bg-inverse-on-surface text-primary-container font-label-md text-label-md py-4 rounded-full flex items-center justify-center gap-2 hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_25px_rgba(214,196,171,0.2)] disabled:opacity-50 group" 
              type="submit"
              disabled={loading || !dni}
            >
              <span>{loading ? "Verificando..." : "Continuar"}</span>
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={registerUser}>
            <div className="text-center mb-2">
              <h2 className="text-xl font-headline-md text-secondary-fixed-dim font-bold mb-1">¡Primera vez!</h2>
              <p className="text-surface-variant/80 text-sm">Completá tus datos para crear tu tarjeta digital.</p>
            </div>
            
            <FloatingInput id="fullname" label="Nombre Completo *" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <FloatingInput id="dni-reg" label="DNI *" type="text" inputMode="numeric" value={dni} onChange={handleDniChange} inputClassName="tracking-widest" required />
            <FloatingInput id="phone" label="Teléfono (Opcional)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <FloatingInput id="birthdate" label="Fecha de Nacimiento (Opcional)" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            <div className="mb-2"><FloatingInput id="email" label="Correo Electrónico (Opcional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>

            <Feedback message={null} error={error} />

            <button 
              className="w-full bg-inverse-on-surface text-primary-container font-label-md text-label-md py-4 rounded-full flex items-center justify-center gap-2 hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_25px_rgba(214,196,171,0.2)] disabled:opacity-50 group" 
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "Registrando..." : "Crear mi Tarjeta"}</span>
              {!loading && <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110" />}
            </button>
            <button 
              type="button" 
              onClick={() => { setStep("dni"); setError(null); }}
              className="text-sm text-surface-variant/50 hover:text-surface-variant transition-colors"
            >
              ← Volver
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Feedback({
  error,
  message,
}: {
  error: string | null;
  message: string | null;
}) {
  if (message) {
    return (
      <div className="rounded-xl bg-brand-accent/10 border border-brand-accent/20 px-4 py-4 text-sm font-medium text-brand-accent text-center">
        {message}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-900/20 border border-red-500/20 px-4 py-4 text-sm font-medium text-red-400 text-center">
        {error}
      </div>
    );
  }

  return null;
}
