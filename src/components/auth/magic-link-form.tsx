"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "dni" | "email";

export function MagicLinkForm() {
  const [mode, setMode] = useState<Mode>("dni");
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetFeedback = () => {
    setMessage(null);
    setError(null);
  };

  const loginWithDni = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    resetFeedback();

    try {
      const response = await fetch("/api/auth/dni-login", {
        method: "POST",
        body: JSON.stringify({ dni }),
      });
      
      const json = await response.json().catch(() => null) as { error?: string } | null;

      if (!response.ok || !json) {
        setError(json?.error ?? "No pudimos entrar con ese DNI.");
        return;
      }

      window.location.href = "/dashboard";
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Error al intentar iniciar sesión.",
      );
    } finally {
      setLoading(false);
    }
  };

  const sendMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    resetFeedback();

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: fullName,
            dni,
            phone,
            birth_date: birthDate,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setMessage("Listo. Revisa tu email para crear o abrir tu tarjeta.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No se pudo enviar el enlace.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Switcher Component
  const TabSwitcher = () => (
    <div className="mb-8 grid grid-cols-2 gap-2 rounded-lg bg-surface-variant/10 p-1">
      <button
        className={`h-10 rounded-md text-sm font-semibold transition ${
          mode === "dni"
            ? "bg-secondary-fixed-dim text-on-secondary-fixed shadow-sm"
            : "text-surface-variant/60 hover:text-surface-variant"
        }`}
        onClick={() => {
          setMode("dni");
          resetFeedback();
        }}
        type="button"
      >
        DNI Rápido
      </button>
      <button
        className={`h-10 rounded-md text-sm font-semibold transition ${
          mode === "email"
            ? "bg-secondary-fixed-dim text-on-secondary-fixed shadow-sm"
            : "text-surface-variant/60 hover:text-surface-variant"
        }`}
        onClick={() => {
          setMode("email");
          resetFeedback();
        }}
        type="button"
      >
        Primera Vez
      </button>
    </div>
  );

  return (
    <section className="w-full max-w-md relative group perspective-1000">
      {/* Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-to-br from-secondary-fixed-dim/20 to-transparent rounded-xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
      
      <div className="relative bg-tertiary-container/40 backdrop-blur-xl border border-surface-variant/10 rounded-xl p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        
        <TabSwitcher />

        {mode === "dni" ? (
          <form className="flex flex-col gap-6" onSubmit={loginWithDni}>
            <div className="relative pt-2">
              <input 
                className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-2 text-inverse-on-surface font-body-md text-body-md focus:ring-0 focus:border-secondary-fixed-dim transition-colors placeholder-transparent" 
                id="dni-login" 
                placeholder="DNI" 
                required 
                type="text" 
                inputMode="numeric"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
              />
              <label 
                className="absolute left-0 top-4 text-surface-variant font-body-md text-body-md cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-label-sm peer-focus:font-label-sm peer-focus:text-secondary-fixed-dim peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-label-sm peer-[:not(:placeholder-shown)]:font-label-sm peer-[:not(:placeholder-shown)]:text-surface-variant" 
                htmlFor="dni-login"
              >
                DNI
              </label>
            </div>

            <Feedback message={message} error={error} />

            <button 
              className="w-full bg-inverse-on-surface text-primary-container font-label-md text-label-md py-4 rounded-full flex items-center justify-center gap-2 hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_25px_rgba(214,196,171,0.2)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none mt-2" 
              type="submit"
              disabled={loading}
            >
              <span className="">{loading ? "Entrando..." : "Entrar a mi tarjeta"}</span>
              {!loading && <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">arrow_forward</span>}
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={sendMagicLink}>
            <div className="relative pt-2">
              <input 
                className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-2 text-inverse-on-surface font-body-md text-body-md focus:ring-0 focus:border-secondary-fixed-dim transition-colors placeholder-transparent" 
                id="fullname" 
                placeholder="Nombre Completo" 
                required 
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <label 
                className="absolute left-0 top-4 text-surface-variant font-body-md text-body-md cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-label-sm peer-focus:font-label-sm peer-focus:text-secondary-fixed-dim peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-label-sm peer-[:not(:placeholder-shown)]:font-label-sm peer-[:not(:placeholder-shown)]:text-surface-variant" 
                htmlFor="fullname"
              >
                Nombre Completo
              </label>
            </div>

            <div className="relative pt-2">
              <input 
                className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-2 text-inverse-on-surface font-body-md text-body-md focus:ring-0 focus:border-secondary-fixed-dim transition-colors placeholder-transparent" 
                id="dni-reg" 
                placeholder="DNI" 
                required 
                type="text" 
                inputMode="numeric"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
              />
              <label 
                className="absolute left-0 top-4 text-surface-variant font-body-md text-body-md cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-label-sm peer-focus:font-label-sm peer-focus:text-secondary-fixed-dim peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-label-sm peer-[:not(:placeholder-shown)]:font-label-sm peer-[:not(:placeholder-shown)]:text-surface-variant" 
                htmlFor="dni-reg"
              >
                DNI
              </label>
            </div>

            <div className="relative pt-2">
              <input 
                className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-2 text-inverse-on-surface font-body-md text-body-md focus:ring-0 focus:border-secondary-fixed-dim transition-colors placeholder-transparent" 
                id="phone" 
                placeholder="Teléfono" 
                required 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <label 
                className="absolute left-0 top-4 text-surface-variant font-body-md text-body-md cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-label-sm peer-focus:font-label-sm peer-focus:text-secondary-fixed-dim peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-label-sm peer-[:not(:placeholder-shown)]:font-label-sm peer-[:not(:placeholder-shown)]:text-surface-variant" 
                htmlFor="phone"
              >
                Teléfono
              </label>
            </div>

            <div className="relative pt-2">
              <input 
                className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-2 text-inverse-on-surface font-body-md text-body-md focus:ring-0 focus:border-secondary-fixed-dim transition-colors placeholder-transparent [color-scheme:dark]" 
                id="birthdate" 
                placeholder="Fecha de Nacimiento" 
                required 
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              <label 
                className="absolute left-0 -top-2 text-surface-variant font-label-sm text-label-sm transition-all duration-300 peer-focus:text-secondary-fixed-dim" 
                htmlFor="birthdate"
              >
                Fecha de Nacimiento
              </label>
            </div>

            <div className="relative pt-2 mb-2">
              <input 
                className="peer w-full bg-transparent border-0 border-b border-surface-variant/30 px-0 py-2 text-inverse-on-surface font-body-md text-body-md focus:ring-0 focus:border-secondary-fixed-dim transition-colors placeholder-transparent" 
                id="email" 
                placeholder="Correo Electrónico" 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label 
                className="absolute left-0 top-4 text-surface-variant font-body-md text-body-md cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-label-sm peer-focus:font-label-sm peer-focus:text-secondary-fixed-dim peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-label-sm peer-[:not(:placeholder-shown)]:font-label-sm peer-[:not(:placeholder-shown)]:text-surface-variant" 
                htmlFor="email"
              >
                Correo Electrónico
              </label>
            </div>

            <Feedback message={message} error={error} />

            <button 
              className="w-full bg-inverse-on-surface text-primary-container font-label-md text-label-md py-4 rounded-full flex items-center justify-center gap-2 hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_25px_rgba(214,196,171,0.2)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none mt-2" 
              type="submit"
              disabled={loading}
            >
              <span className="">{loading ? "Enviando..." : "Registrarse"}</span>
              {!loading && <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">auto_awesome</span>}
            </button>
            <p className="font-label-sm text-label-sm text-surface-variant/50 text-center mt-2">
              Al registrarte, aceptas nuestros términos de servicio.
            </p>
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
      <p className="rounded-lg bg-secondary-fixed-dim/10 border border-secondary-fixed-dim/20 px-4 py-3 text-sm font-medium text-secondary-fixed-dim">
        {message}
      </p>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg bg-red-900/20 border border-red-500/20 px-4 py-3 text-sm font-medium text-red-400">
        {error}
      </p>
    );
  }

  return null;
}
