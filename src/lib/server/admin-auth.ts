import "server-only";
import { isAdminAuthenticated, adminCookieName } from "./admin-session";

export { adminCookieName };

export async function requireAdmin() {
  const isAdmin = await isAdminAuthenticated();
  return { ok: isAdmin };
}
