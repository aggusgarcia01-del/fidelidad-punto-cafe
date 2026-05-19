import { NextRequest, NextResponse } from "next/server";
import { getCustomerSessionUserId } from "@/lib/server/customer-session";
import {
  getBearerToken,
  getOrCreateProfile,
  getProfileByUserId,
} from "@/lib/server/profile";

export async function GET(request: NextRequest) {
  const token = getBearerToken(request);

  if (token) {
    const result = await getOrCreateProfile(token);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  }

  const userId = await getCustomerSessionUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getProfileByUserId(userId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getOrCreateProfile(token);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result, { status: 201 });
}
