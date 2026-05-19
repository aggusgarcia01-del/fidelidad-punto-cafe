import { NextRequest, NextResponse } from "next/server";
import { adminCookieName } from "@/lib/server/admin-auth";

export async function POST(request: NextRequest) {
  const { pin } = (await request.json().catch(() => ({}))) as { pin?: string };

  if (!process.env.ADMIN_PIN || pin !== process.env.ADMIN_PIN) {
    return NextResponse.json({ error: "PIN invalido" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 10,
  });

  return response;
}
