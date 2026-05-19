import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const adminCookieName = "puntocafe_admin";

function getSessionSecret() {
  return process.env.CUSTOMER_SESSION_SECRET || "puntocafe-local-dev-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export function createAdminSessionValue() {
  const value = "admin";
  return `${value}.${sign(value)}`;
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(adminCookieName, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 10, // 10 hours
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookieName);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const value = cookieStore.get(adminCookieName)?.value;

  if (!value) {
    return false;
  }

  const [sessionVal, signature] = value.split(".");

  if (sessionVal !== "admin" || !signature) {
    return false;
  }

  const expected = sign(sessionVal);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
