import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';
import { verifyAdminSessionToken } from '@/lib/adminSession';

export function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return '';
  const parts = cookieHeader.split(';').map((p) => p.trim());
  for (const part of parts) {
    if (!part.startsWith(`${name}=`)) continue;
    return decodeURIComponent(part.slice(name.length + 1));
  }
  return '';
}

export function getAdminTokenFromRequest(request: Request) {
  return getCookieValue(request.headers.get('cookie'), ADMIN_TOKEN_COOKIE);
}

export async function requireAdminSession(request: Request) {
  const token = getAdminTokenFromRequest(request);
  if (!token) return { ok: false as const };
  const verified = await verifyAdminSessionToken(token);
  if (!verified.ok) return { ok: false as const };
  return { ok: true as const, email: verified.email };
}
