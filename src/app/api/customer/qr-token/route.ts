import { NextResponse } from "next/server";
import { getCustomerSessionUserId } from "@/lib/server/customer-session";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";
import { generateQRToken } from "@/lib/qr-token";

export async function GET() {
  assertSupabaseAdminEnv();

  const userId = await getCustomerSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Obtener DNI del usuario
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("dni")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  try {
    const token = await generateQRToken(userId, user.dni || "");
    return NextResponse.json({ token });
  } catch (err) {
    return NextResponse.json({ error: "Error generando token" }, { status: 500 });
  }
}
