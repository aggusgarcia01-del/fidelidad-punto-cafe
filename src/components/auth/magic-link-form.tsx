"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, IdCard, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "dni" | "email";

export function MagicLinkForm() {
  const [mode, setMode] = useState<Mode>("dni");
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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

    const response = await fetch("/api/auth/dni-login", {
      method: "POST",
      body: JSON.stringify({ dni }),
    });
    const json = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(json.error ?? "No pudimos entrar con ese DNI.");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
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

  return (
    <div className="glass-panel w-full rounded-lg p-5 shadow-soft sm:p-7">
      <div className="mb-6">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-caramel/16 text-caramel">
          {mode === "dni" ? (
            <IdCard className="h-5 w-5" />
          ) : (
            <Mail className="h-5 w-5" />
          )}
        </div>
        <h2 className="text-2xl font-semibold text-espresso">
          {mode === "dni" ? "Entrar a mi tarjeta" : "Crear tarjeta"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-espresso/60">
          {mode === "dni"
            ? "Si ya te registraste, entra con tu DNI sin esperar emails."
            : "La primera vez validamos tu email con magic link."}
        </p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-espresso/6 p-1">
        <button
          className={`h-10 rounded-md text-sm font-semibold transition ${
            mode === "dni"
              ? "bg-porcelain text-espresso shadow-sm"
              : "text-espresso/54"
          }`}
          onClick={() => {
            setMode("dni");
            resetFeedback();
          }}
          type="button"
        >
          DNI
        </button>
        <button
          className={`h-10 rounded-md text-sm font-semibold transition ${
            mode === "email"
              ? "bg-porcelain text-espresso shadow-sm"
              : "text-espresso/54"
          }`}
          onClick={() => {
            setMode("email");
            resetFeedback();
          }}
          type="button"
        >
          Primera vez
        </button>
      </div>

      {mode === "dni" ? (
        <form onSubmit={loginWithDni}>
          <Input
            label="DNI"
            value={dni}
            onChange={(event) => setDni(event.target.value)}
            placeholder="Ej. 30123456"
            inputMode="numeric"
            required
          />
          <Feedback message={message} error={error} />
          <Button className="mt-6 w-full" loading={loading} type="submit">
            Entrar
            <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-4 text-center text-xs leading-5 text-espresso/45">
            Para este MVP, el DNI funciona como codigo rapido de acceso.
          </p>
        </form>
      ) : (
        <form onSubmit={sendMagicLink}>
          <div className="space-y-4">
            <Input
              label="Nombre completo"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Ej. Sofia Martinez"
              required
            />
            <Input
              label="DNI"
              value={dni}
              onChange={(event) => setDni(event.target.value)}
              placeholder="Ej. 30123456"
              inputMode="numeric"
              required
            />
            <Input
              label="Telefono"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+54 9 11 ..."
              inputMode="tel"
              required
            />
            <Input
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@email.com"
              type="email"
              required
            />
          </div>
          <Feedback message={message} error={error} />
          <Button className="mt-6 w-full" loading={loading} type="submit">
            Enviar magic link
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
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
      <p className="mt-4 rounded-lg bg-caramel/12 px-4 py-3 text-sm font-medium text-espresso">
        {message}
      </p>
    );
  }

  if (error) {
    return (
      <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {error}
      </p>
    );
  }

  return null;
}
