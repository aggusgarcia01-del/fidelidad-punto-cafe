import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  assertSupabaseAdminEnv();

  const search = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  let query = supabaseAdmin
    .from("users")
    .select("id, full_name, dni, phone, email, birth_date, created_at, loyalty_cards(id, stamps, total_rewards, updated_at)")
    .order("created_at", { ascending: false })
    .limit(30);

  if (search) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        search,
      );

    query = isUuid
      ? query.eq("id", search)
      : query.or(
          `full_name.ilike.%${search}%,dni.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
        );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customers: data ?? [] });
}
