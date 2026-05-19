import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient<Database>(
  url ?? "https://missing-supabase-url.supabase.co",
  serviceRoleKey ?? "missing-service-role-key",
  {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  },
);

export function assertSupabaseAdminEnv() {
  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
}
