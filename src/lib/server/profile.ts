import "server-only";
import { NextRequest } from "next/server";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";

export function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ")
    ? authorization.replace("Bearer ", "")
    : null;
}

export async function getOrCreateProfile(token: string) {
  assertSupabaseAdminEnv();

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.getUser(token);

  const email = authData.user?.email;

  if (authError || !authData.user || !email) {
    return { error: "Sesion invalida", status: 401 } as const;
  }

  const authUser = authData.user;
  const fullName =
    String(authUser.user_metadata.full_name ?? "").trim() ||
    email.split("@")[0] ||
    "Cliente PuntoCafe";
  const phone = String(authUser.user_metadata.phone ?? "").trim() || null;
  const dni =
    String(authUser.user_metadata.dni ?? "")
      .replace(/\D/g, "")
      .trim() || null;

  // Fetch existing user to preserve database-only values like DNI
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("id, full_name, dni, phone, email, created_at")
    .eq("email", email)
    .maybeSingle();

  const finalDni = existingUser?.dni || dni;
  const finalPhone = existingUser?.phone || phone;
  const finalFullName = existingUser?.full_name || fullName;

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .upsert(
      {
        email,
        full_name: finalFullName,
        dni: finalDni,
        phone: finalPhone,
      },
      { onConflict: "email" },
    )
    .select("id, full_name, dni, phone, email, created_at")
    .single();

  if (userError || !user) {
    return { error: userError?.message ?? "No se pudo crear el perfil", status: 500 } as const;
  }

  const { data: existingCard } = await supabaseAdmin
    .from("loyalty_cards")
    .select("id, user_id, stamps, total_rewards, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingCard) {
    return { user, card: existingCard };
  }

  const { data: card, error: cardError } = await supabaseAdmin
    .from("loyalty_cards")
    .insert({ user_id: user.id, stamps: 0, total_rewards: 0 })
    .select("id, user_id, stamps, total_rewards, updated_at")
    .single();

  if (cardError || !card) {
    return { error: cardError?.message ?? "No se pudo crear la tarjeta", status: 500 } as const;
  }

  return { user, card };
}

export async function getProfileByUserId(userId: string) {
  assertSupabaseAdminEnv();

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id, full_name, dni, phone, email, created_at")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    return { error: "Cliente no encontrado", status: 404 } as const;
  }

  const { data: card, error: cardError } = await supabaseAdmin
    .from("loyalty_cards")
    .select("id, user_id, stamps, total_rewards, updated_at")
    .eq("user_id", user.id)
    .single();

  if (cardError || !card) {
    return { error: "Tarjeta no encontrada", status: 404 } as const;
  }

  return { user, card };
}
