import { NextRequest, NextResponse } from "next/server";
import { setCustomerSession } from "@/lib/server/customer-session";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";

function normalizeDni(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(request: NextRequest) {
  assertSupabaseAdminEnv();

  const body = await request.json().catch(() => ({}));
  const { full_name, dni, phone, email, birth_date } = body as {
    full_name?: string;
    dni?: string;
    phone?: string;
    email?: string;
    birth_date?: string;
  };

  const normalizedDni = normalizeDni(dni ?? "");

  if (!full_name || !normalizedDni) {
    return NextResponse.json(
      { error: "Nombre y DNI son requeridos." },
      { status: 400 },
    );
  }

  if (normalizedDni.length < 6 || normalizedDni.length > 9) {
    return NextResponse.json(
      { error: "Ingresa un DNI valido." },
      { status: 400 },
    );
  }

  // Verificar si ya existe
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("dni", normalizedDni)
    .single();

  if (existingUser) {
    return NextResponse.json(
      { error: "Ya existe un usuario con ese DNI." },
      { status: 409 },
    );
  }

  // 1. Crear usuario en tabla users
  const { data: newUser, error: userError } = await supabaseAdmin
    .from("users")
    .insert({ 
      full_name, 
      dni: normalizedDni, 
      phone: phone || null, 
      email: email || null,
      birth_date: birth_date || null
    })
    .select()
    .single();

  if (userError || !newUser) {
    return NextResponse.json({ error: "Error al crear el usuario." }, { status: 500 });
  }

  // 2. Crear loyalty_card vacía para el usuario
  const { error: cardError } = await supabaseAdmin
    .from("loyalty_cards")
    .insert({ user_id: newUser.id, stamps: 0, total_rewards: 0 });

  if (cardError) {
    // Si falla la tarjeta, idealmente habría un rollback, pero seguimos por robustez básica
    console.error("Error creando tarjeta:", cardError);
  }

  // 3. Crear sesión directa
  await setCustomerSession(newUser.id);
  
  return NextResponse.json({ status: "OK", user: newUser }, { status: 201 });
}
