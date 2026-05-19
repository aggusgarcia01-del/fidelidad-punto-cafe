import { NextResponse } from "next/server";
import { clearCustomerSession } from "@/lib/server/customer-session";

export async function POST() {
  await clearCustomerSession();
  return NextResponse.json({ ok: true });
}
