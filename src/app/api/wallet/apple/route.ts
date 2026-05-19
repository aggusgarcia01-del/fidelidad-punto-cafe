import { NextRequest, NextResponse } from "next/server";
import { getCustomerSessionUserId } from "@/lib/server/customer-session";
import {
  getBearerToken,
  getOrCreateProfile,
  getProfileByUserId,
} from "@/lib/server/profile";

export async function GET(request: NextRequest) {
  const token = getBearerToken(request);

  if (!token) {
    const userId = await getCustomerSessionUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getProfileByUserId(userId);

    if ("error" in profile) {
      return NextResponse.json({ error: profile.error }, { status: profile.status });
    }

    return NextResponse.json({
      status: "credentials_required",
      message:
        "Apple Wallet requiere certificados PassKit. La ruta ya identifica al cliente y queda lista para generar el .pkpass con passkit-generator.",
      userId: profile.user.id,
      stamps: profile.card.stamps,
    });
  }

  const profile = await getOrCreateProfile(token);

  if ("error" in profile) {
    return NextResponse.json({ error: profile.error }, { status: profile.status });
  }

  return NextResponse.json({
    status: "credentials_required",
    message:
      "Apple Wallet requiere certificados PassKit. La ruta ya identifica al cliente y queda lista para generar el .pkpass con passkit-generator.",
    userId: profile.user.id,
    stamps: profile.card.stamps,
  });
}
