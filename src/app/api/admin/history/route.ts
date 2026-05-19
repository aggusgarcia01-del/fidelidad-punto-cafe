import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";
import type { LoyaltyEvent } from "@/types/database";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  assertSupabaseAdminEnv();

  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ events: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("loyalty_events")
    .select("id, user_id, card_id, type, stamps_before, stamps_after, note, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error?.code === "42P01" || error?.code === "PGRST205") {
    return NextResponse.json({
      events: [],
      historyEnabled: false,
      message: "La tabla loyalty_events todavia no existe.",
    });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    events: (data ?? []) as LoyaltyEvent[],
    historyEnabled: true,
  });
}
