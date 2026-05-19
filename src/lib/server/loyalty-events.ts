import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type LoyaltyEventInsert =
  Database["public"]["Tables"]["loyalty_events"]["Insert"];

export async function logLoyaltyEvent(event: LoyaltyEventInsert) {
  const { error } = await supabaseAdmin.from("loyalty_events").insert(event);

  // The MVP can run before the optional history table is created.
  if (error && error.code !== "42P01" && error.code !== "PGRST205") {
    console.error("Could not log loyalty event", error);
  }
}
