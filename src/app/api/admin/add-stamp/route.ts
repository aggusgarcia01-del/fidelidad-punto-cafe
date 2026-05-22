import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/admin-auth";
import { logLoyaltyEvent } from "@/lib/server/loyalty-events";
import { assertSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase/admin";
import { verifyStampCode } from "@/lib/server/stamp-code";
import type { Database } from "@/types/database";

type LoyaltyCard = Database["public"]["Tables"]["loyalty_cards"]["Row"];

function normalizeDni(value: string) {
  return value.replace(/\D/g, "");
}

import { verifyQRToken } from "@/lib/qr-token";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  assertSupabaseAdminEnv();

  const { dni, code, qrToken } = (await request.json().catch(() => ({}))) as {
    dni?: string;
    code?: string;
    qrToken?: string;
  };

  if (!qrToken && (!dni || !code)) {
    return NextResponse.json({ error: "DNI y código o QR Token son requeridos." }, { status: 400 });
  }

  let finalUserId = "";
  let finalFullName = "";

  if (qrToken) {
    try {
      const payload = await verifyQRToken(qrToken);
      finalUserId = payload.userId;
      
      const { data } = await supabaseAdmin
        .from("users")
        .select("full_name")
        .eq("id", finalUserId)
        .single();
        
      if (!data) throw new Error("Usuario no encontrado");
      finalFullName = data.full_name;
    } catch {
      return NextResponse.json({ error: "QR inválido o expirado." }, { status: 400 });
    }
  } else {
    const normalizedDni = normalizeDni(dni!);
    const { data, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, full_name")
      .eq("dni", normalizedDni)
      .single();

    if (userError || !data) {
      return NextResponse.json({ error: "No se encontró cliente con ese DNI." }, { status: 404 });
    }

    const isValid = verifyStampCode(data.id, code!);
    if (!isValid) {
      return NextResponse.json({ error: "Código incorrecto o expirado." }, { status: 400 });
    }
    
    finalUserId = data.id;
    finalFullName = data.full_name;
  }

  // 3. Get loyalty card
  const { data: card, error: cardError } = await supabaseAdmin
    .from("loyalty_cards")
    .select("id, stamps, total_rewards")
    .eq("user_id", finalUserId)
    .single<LoyaltyCard>();

  if (cardError || !card) {
    return NextResponse.json({ error: "El cliente no tiene tarjeta de fidelidad activa." }, { status: 404 });
  }

  // 4. Insert into 'stamps' ledger table
  const { error: ledgerError } = await supabaseAdmin
    .from("stamps")
    .insert({ user_id: finalUserId });

  if (ledgerError) {
    return NextResponse.json({ error: "Error al registrar el sello en el historial (SQL)." }, { status: 500 });
  }

  // 5. Update active stamps on 'loyalty_cards'
  const newStamps = Math.min(card.stamps + 1, 5);
  const { data: updatedCard, error: updateError } = await supabaseAdmin
    .from("loyalty_cards")
    .update({ stamps: newStamps, updated_at: new Date().toISOString() })
    .eq("id", card.id)
    .select("id, stamps, total_rewards, updated_at")
    .single<LoyaltyCard>();

  if (updateError || !updatedCard) {
    return NextResponse.json({ error: updateError?.message ?? "Error actualizando tarjeta." }, { status: 500 });
  }

  // 6. Log loyalty event
  await logLoyaltyEvent({
    user_id: finalUserId,
    card_id: card.id,
    type: "stamp_added",
    stamps_before: card.stamps,
    stamps_after: updatedCard.stamps,
    note: updatedCard.stamps >= 5 ? "reward_ready" : null,
  });

  return NextResponse.json({
    customerName: finalFullName,
    stamps: updatedCard.stamps,
    message: updatedCard.stamps >= 5
      ? "Sello agregado. ¡El cliente completó los 5 sellos para su café gratis!"
      : "Sello agregado correctamente.",
  });
}
