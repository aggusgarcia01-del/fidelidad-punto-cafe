import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const customerCookieName = "puntocafe_customer";

function getSessionSecret() {
  return (
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_PIN ||
    "puntocafe-local-session"
  );
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export function createCustomerSessionValue(userId: string) {
  return `${userId}.${sign(userId)}`;
}

export async function setCustomerSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(customerCookieName, createCustomerSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}

export async function clearCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(customerCookieName);
}

export async function getCustomerSessionUserId() {
  const cookieStore = await cookies();
  const value = cookieStore.get(customerCookieName)?.value;

  if (!value) {
    return null;
  }

  const [userId, signature] = value.split(".");

  if (!userId || !signature) {
    return null;
  }

  const expected = sign(userId);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return null;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer) ? userId : null;
}
