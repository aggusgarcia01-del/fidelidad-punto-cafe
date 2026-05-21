import { NextRequest, NextResponse } from "next/server";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  assertSupabaseAdminEnv();

  const { dni, email } = (await request.json().catch(() => ({}))) as {
    dni?: string;
    email?: string;
  };

  const cleanDni = dni ? dni.replace(/\D/g, "") : "";
  const cleanEmail = email ? email.trim().toLowerCase() : "";

  if (cleanDni) {
    const { data: existingDniUser } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("dni", cleanDni)
      .maybeSingle();

    if (existingDniUser) {
      return NextResponse.json({
        available: false,
        reason: "dni_taken",
        message: "Este DNI ya está registrado. Podes ingresar directamente con DNI Rápido."
      });
    }
  }

  if (cleanEmail) {
    const { data: existingEmailUser } = await supabaseAdmin
      .from("users")
      .select("dni")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingEmailUser) {
      return NextResponse.json({
        available: false,
        reason: "email_taken",
        message: "Este correo electrónico ya está registrado."
      });
    }
  }

  return NextResponse.json({ available: true });
}
