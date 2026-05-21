import { NextRequest, NextResponse } from "next/server";
import { setCustomerSession } from "@/lib/server/customer-session";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";

function normalizeDni(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(request: NextRequest) {
  assertSupabaseAdminEnv();

  const { dni } = (await request.json().catch(() => ({}))) as {
    dni?: string;
  };
  const normalized = normalizeDni(dni ?? "");

  if (normalized.length < 6 || normalized.length > 9) {
    return NextResponse.json(
      { error: "Ingresa un DNI valido." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, full_name, dni, phone, email, created_at")
    .eq("dni", normalized)
    .limit(2);

  if (error) {
    if (error.code === "42703" || error.code === "PGRST204") {
      return NextResponse.json(
        { error: "Falta agregar la columna DNI en Supabase." },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "USER_NOT_FOUND", message: "No encontramos una tarjeta con ese DNI." },
      { status: 404 },
    );
  }

  if (data.length > 1) {
    return NextResponse.json(
      { error: "Hay mas de una tarjeta con ese DNI." },
      { status: 409 },
    );
  }

  await setCustomerSession(data[0].id);
  return NextResponse.json({ ok: true, user: data[0] });
}
