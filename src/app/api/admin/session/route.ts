import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';
import { verifyAdminSessionToken } from '@/lib/adminSession';
import { setCsrfTokenCookie } from '@/lib/csrf';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  
  // Set CSRF token cookie for login page
  const authResult = !token ? false : (await verifyAdminSessionToken(token)).ok;
  const response = NextResponse.json({ ok: true, data: { authenticated: authResult } });
  setCsrfTokenCookie(response);
  
  return response;
}