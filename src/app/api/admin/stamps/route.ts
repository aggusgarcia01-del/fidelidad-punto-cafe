import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { logLoyaltyEvent } from "@/lib/server/loyalty-events";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type LoyaltyCard = Database["public"]["Tables"]["loyalty_cards"]["Row"];

import { verifyQRToken } from "@/lib/qr-token";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  assertSupabaseAdminEnv();

  const body = (await request.json().catch(() => ({}))) as {
    userId?: string;
    qrToken?: string;
  };

  let userId = body.userId;

  if (body.qrToken) {
    try {
      const payload = await verifyQRToken(body.qrToken);
      userId = payload.userId;
    } catch (err) {
      return NextResponse.json({ error: "El código QR es inválido o ha expirado." }, { status: 400 });
    }
  }

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

  const stamps = Math.min(card.stamps + 1, 5);
  const { data, error } = await supabaseAdmin
    .from("loyalty_cards")
    .update({ stamps, updated_at: new Date().toISOString() })
    .eq("id", card.id)
    .select("id, stamps, total_rewards, updated_at")
    .single<LoyaltyCard>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logLoyaltyEvent({
    user_id: userId,
    card_id: card.id,
    type: "stamp_added",
    stamps_before: card.stamps,
    stamps_after: data.stamps,
    note: data.stamps >= 5 ? "reward_ready" : null,
  });

  return NextResponse.json({
    card: data,
    message:
      data.stamps >= 5
        ? "Sello agregado. El cliente ya tiene cafe gratis."
        : "Sello agregado correctamente.",
  });
}
