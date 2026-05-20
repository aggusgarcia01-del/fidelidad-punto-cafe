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
  const { userId, fullName, phone, dni, birthDate } = body;

  if (!userId) {
    return NextResponse.json({ error: "Falta userId" }, { status: 400 });
  }

  const updates: Record<string, string | null> = {};
  if (fullName !== undefined) updates.full_name = fullName;
  if (phone !== undefined) updates.phone = phone;
  if (dni !== undefined) updates.dni = dni;
  if (birthDate !== undefined) updates.birth_date = birthDate || null;

  const { error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Cliente actualizado" });
}
