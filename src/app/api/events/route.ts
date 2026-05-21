import { NextResponse } from "next/server";
import { getCustomerSessionUserId } from "@/lib/server/customer-session";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  assertSupabaseAdminEnv();

  const userId = await getCustomerSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("loyalty_events")
    .select("id, type, stamps_after, created_at, note")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(15);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
