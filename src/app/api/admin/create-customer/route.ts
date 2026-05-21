import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  assertSupabaseAdminEnv();

  const body = await request.json().catch(() => ({}));
  const { fullName, dni, email, phone, birthDate } = body;

  if (!fullName) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  const cleanDni = dni ? dni.replace(/\D/g, "") : null;
  const cleanEmail = email ? email.trim().toLowerCase() : null;

  // Pre-check DNI uniqueness
  if (cleanDni) {
    const { data: existingDni } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("dni", cleanDni)
      .maybeSingle();

    if (existingDni) {
      return NextResponse.json(
        { error: "Ya existe un cliente con ese número de DNI." },
        { status: 400 }
      );
    }
  }

  // Pre-check Email uniqueness
  if (cleanEmail) {
    const { data: existingEmail } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { error: "Ya existe un cliente registrado con ese correo electrónico." },
        { status: 400 }
      );
    }
  }

  // Insert user
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .insert({
      full_name: fullName,
      dni: cleanDni,
      email: cleanEmail,
      phone: phone || null,
      birth_date: birthDate || null,
    })
    .select()
    .single();

  if (userError || !user) {
    return NextResponse.json(
      { error: userError?.message || "Error al crear el perfil del cliente." },
      { status: 500 }
    );
  }

  // Insert loyalty card
  const { data: card, error: cardError } = await supabaseAdmin
    .from("loyalty_cards")
    .insert({
      user_id: user.id,
      stamps: 0,
      total_rewards: 0,
    })
    .select()
    .single();

  if (cardError || !card) {
    // Attempt rollback of the user if card fails
    await supabaseAdmin.from("users").delete().eq("id", user.id);
    return NextResponse.json(
      { error: cardError?.message || "Error al inicializar la tarjeta de fidelidad." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Cliente creado exitosamente",
    customer: {
      ...user,
      loyalty_cards: [card],
    },
  });
}
