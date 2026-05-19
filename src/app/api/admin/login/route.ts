import { NextRequest, NextResponse } from "next/server";
import { setAdminSession } from "@/lib/server/admin-session";

export async function POST(request: NextRequest) {
  const { pin } = (await request.json().catch(() => ({}))) as { pin?: string };

  if (!process.env.ADMIN_PIN || pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: "PIN invalido" }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
