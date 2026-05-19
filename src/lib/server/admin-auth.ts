import "server-only";
import { cookies } from "next/headers";

export const adminCookieName = "puntocafe_admin";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(adminCookieName)?.value === "1";
  return { ok: isAdmin };
}
