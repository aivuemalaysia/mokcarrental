import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';
import { verifyAdminSessionToken } from '@/lib/adminSession';
import { generateCsrfToken, setCsrfTokenCookie } from '@/lib/csrf';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  
  // Generate CSRF token and set it as a cookie
  const response = NextResponse.json({ 
    ok: true, 
    data: { 
      authenticated: !!token,
      csrfToken: generateCsrfToken() // Return token in response body
    } 
  });
  
  // Also set the cookie for server-side validation
  setCsrfTokenCookie(response);
  
  return response;
}
