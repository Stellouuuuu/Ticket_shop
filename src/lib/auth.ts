import type { AdminContext } from "./admin-db";
import { validateSession } from "./admin-db";

function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export async function getAdminFromRequest(
  request: Request
): Promise<AdminContext | null> {
  const token = getBearerToken(request);
  if (!token) return null;
  return validateSession(token);
}

export async function requireAdmin(
  request: Request
): Promise<AdminContext | null> {
  return getAdminFromRequest(request);
}
