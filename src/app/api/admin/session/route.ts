import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';
import { verifyAdminSessionToken } from '@/lib/adminSession';
import { generateCsrfToken, setCsrfTokenCookie } from '@/lib/csrf';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  
  // Set httpOnly CSRF cookie for validation
  const response = NextResponse.json({ ok: true, data: { authenticated: !!token } });
  setCsrfTokenCookie(response);
  
  return response;
}