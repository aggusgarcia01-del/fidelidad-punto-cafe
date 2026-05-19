import { NextRequest, NextResponse } from "next/server";
import { setCustomerSession } from "@/lib/server/customer-session";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

export async function POST(request: NextRequest) {
  assertSupabaseAdminEnv();

  const { phone } = (await request.json().catch(() => ({}))) as {
    phone?: string;
  };
  const normalized = normalizePhone(phone ?? "");

  if (normalized.length < 6) {
    return NextResponse.json(
      { error: "Ingresa un telefono valido." },
      { status: 400 },
    );
  }

  const digits = normalized.replace(/\D/g, "");
  const lastDigits = digits.slice(-8);

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, full_name, phone, email, created_at")
    .ilike("phone", `%${lastDigits}%`)
    .limit(2);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "No encontramos una tarjeta con ese telefono." },
      { status: 404 },
    );
  }

  if (data.length > 1) {
    return NextResponse.json(
      { error: "Hay mas de una tarjeta con ese telefono. Usa el email." },
      { status: 409 },
    );
  }

  await setCustomerSession(data[0].id);
  return NextResponse.json({ ok: true, user: data[0] });
}
