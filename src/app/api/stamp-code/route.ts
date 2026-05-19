import { NextResponse } from "next/server";
import { getCustomerSessionUserId } from "@/lib/server/customer-session";
import { generateStampCode } from "@/lib/server/stamp-code";

export async function GET() {
  const userId = await getCustomerSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = generateStampCode(userId);

  return NextResponse.json({ code });
}
