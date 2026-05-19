import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createClient<Database>(
    url ?? "https://missing-supabase-url.supabase.co",
    anonKey ?? "missing-anon-key",
  );
}
