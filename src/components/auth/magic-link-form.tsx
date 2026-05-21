"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ArrowRight, Sparkles } from "lucide-react";

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

  const formatDni = (val: string) => {
    const raw = val.replace(/\D/g, "");
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8); // max 8 dígitos
    setDni(formatDni(raw));
  };

  const loginWithDni = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    resetFeedback();

    const cleanDni = dni.replace(/\D/g, "");

    try {
      const response = await fetch("/api/auth/dni-login", {
        method: "POST",
        body: JSON.stringify({ dni: cleanDni }),
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

    const cleanDni = dni.replace(/\D/g, "");

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: fullName,
            dni: cleanDni,
            phone,
            birth_date: birthDate,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setMessage("¡Listo! Revisa tu email para crear o abrir tu tarjeta. (Puede que llegue a Spam)");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No se pudo enviar el enlace.",
      );
    } finally {
      setLoading(false);
    }
  };

  const TabSwitcher = () => (
    <div className="mb-8 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1 border border-white/5">
      <button
        className={`h-10 rounded-lg text-sm font-bold transition-all ${
          mode === "dni"
            ? "bg-brand-accent/20 text-brand-accent shadow-[0_0_10px_rgba(212,175,55,0.2)]"
            : "text-gray-500 hover:text-gray-300"
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
        className={`h-10 rounded-lg text-sm font-bold transition-all ${
          mode === "email"
            ? "bg-brand-accent/20 text-brand-accent shadow-[0_0_10px_rgba(212,175,55,0.2)]"
            : "text-gray-500 hover:text-gray-300"
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
      <div className="absolute -inset-1 bg-gradient-to-br from-brand-accent/10 to-transparent rounded-2xl blur-2xl opacity-50 transition-opacity duration-500"></div>
      
      <div className="relative glass-panel rounded-3xl p-8 md:p-10 shadow-2xl">
        
        <TabSwitcher />

        {mode === "dni" ? (
          <form className="flex flex-col gap-6" onSubmit={loginWithDni}>
            <div className="relative pt-2">
              <input 
                className="peer w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white font-medium focus:ring-0 focus:border-brand-accent transition-colors placeholder-transparent text-lg tracking-widest" 
                id="dni-login" 
                placeholder="DNI" 
                required 
                type="text" 
                inputMode="numeric"
                value={dni}
                onChange={handleDniChange}
              />
              <label 
                className="absolute left-0 top-4 text-gray-500 text-sm cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand-accent peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500" 
                htmlFor="dni-login"
              >
                DNI
              </label>
            </div>

            <Feedback message={message} error={error} />

            <button 
              className="w-full btn-glow font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-50 transition-transform active:scale-95 group" 
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "Entrando..." : "Entrar a mi tarjeta"}</span>
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={sendMagicLink}>
            <div className="relative pt-2">
              <input 
                className="peer w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white font-medium focus:ring-0 focus:border-brand-accent transition-colors placeholder-transparent" 
                id="fullname" 
                placeholder="Nombre Completo" 
                required 
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <label 
                className="absolute left-0 top-4 text-gray-500 text-sm cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand-accent peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500" 
                htmlFor="fullname"
              >
                Nombre Completo
              </label>
            </div>

            <div className="relative pt-2">
              <input 
                className="peer w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white font-medium focus:ring-0 focus:border-brand-accent transition-colors placeholder-transparent tracking-widest" 
                id="dni-reg" 
                placeholder="DNI" 
                required 
                type="text" 
                inputMode="numeric"
                value={dni}
                onChange={handleDniChange}
              />
              <label 
                className="absolute left-0 top-4 text-gray-500 text-sm cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand-accent peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500" 
                htmlFor="dni-reg"
              >
                DNI
              </label>
            </div>

            <div className="relative pt-2">
              <input 
                className="peer w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white font-medium focus:ring-0 focus:border-brand-accent transition-colors placeholder-transparent" 
                id="phone" 
                placeholder="Teléfono" 
                required 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <label 
                className="absolute left-0 top-4 text-gray-500 text-sm cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand-accent peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500" 
                htmlFor="phone"
              >
                Teléfono
              </label>
            </div>

            <div className="relative pt-2">
              <input 
                className="peer w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white font-medium focus:ring-0 focus:border-brand-accent transition-colors placeholder-transparent [color-scheme:dark]" 
                id="birthdate" 
                placeholder="Fecha de Nacimiento" 
                required 
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              <label 
                className="absolute left-0 -top-2 text-gray-500 text-xs transition-all duration-300 peer-focus:text-brand-accent" 
                htmlFor="birthdate"
              >
                Fecha de Nacimiento
              </label>
            </div>

            <div className="relative pt-2 mb-2">
              <input 
                className="peer w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white font-medium focus:ring-0 focus:border-brand-accent transition-colors placeholder-transparent" 
                id="email" 
                placeholder="Correo Electrónico" 
                required 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label 
                className="absolute left-0 top-4 text-gray-500 text-sm cursor-text transition-all duration-300 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand-accent peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-500" 
                htmlFor="email"
              >
                Correo Electrónico
              </label>
            </div>

            <Feedback message={message} error={error} />

            <button 
              className="w-full btn-glow font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-50 transition-transform active:scale-95 group" 
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "Enviando..." : "Registrarse y Enviar Enlace"}</span>
              {!loading && <Sparkles className="h-4 w-4 transition-transform group-hover:scale-110" />}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
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
