"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Preparando tu tarjeta...");

  useEffect(() => {
    const finishLogin = async () => {
      const supabase = createSupabaseBrowserClient();
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (token) {
        await fetch("/api/profile", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      router.replace("/dashboard");
    };

    void finishLogin();
  }, [router]);

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="glass-panel flex w-full max-w-sm flex-col items-center rounded-lg p-8 text-center shadow-soft">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-espresso text-cream">
          <Coffee className="h-7 w-7" />
        </div>
        <p className="text-base font-medium text-espresso">{message}</p>
      </div>
    </main>
  );
}
