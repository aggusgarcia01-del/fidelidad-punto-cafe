import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { logLoyaltyEvent } from "@/lib/server/loyalty-events";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type LoyaltyCard = Database["public"]["Tables"]["loyalty_cards"]["Row"];

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  assertSupabaseAdminEnv();

  const { userId } = (await request.json().catch(() => ({}))) as {
    userId?: string;
  };

  if (!userId) {
    return NextResponse.json({ error: "Cliente requerido" }, { status: 400 });
  }

  const { data: card, error: cardError } = await supabaseAdmin
    .from("loyalty_cards")
    .select("id, stamps, total_rewards")
    .eq("user_id", userId)
    .single<LoyaltyCard>();

  if (cardError || !card) {
    return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });
  }

  if (card.stamps < 5) {
    return NextResponse.json(
      { error: "La tarjeta todavia no tiene 5 sellos" },
      { status: 409 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("loyalty_cards")
    .update({
      stamps: 0,
      total_rewards: card.total_rewards + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", card.id)
    .select("id, stamps, total_rewards, updated_at")
    .single<LoyaltyCard>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logLoyaltyEvent({
    user_id: userId,
    card_id: card.id,
    type: "reward_redeemed",
    stamps_before: card.stamps,
    stamps_after: data.stamps,
    note: "free_coffee_redeemed",
  });

  return NextResponse.json({
    card: data,
    message: "Cafe gratis canjeado. La tarjeta volvio a 0 sellos.",
  });
}
