import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';
import { verifyAdminSessionToken } from '@/lib/adminSession';
import { generateCsrfToken, setCsrfTokenCookie } from '@/lib/csrf';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get(ADMIN_TOKEN_COOKIE)?.value;
  
  // Generate ONE CSRF token and use it for both cookie and response body
  const csrfToken = generateCsrfToken();
  const response = NextResponse.json({ 
    ok: true, 
    data: { 
      authenticated: !!token,
      csrfToken  // Return the SAME token in response body
    } 
  });
  
  // Set the SAME token as a cookie for server-side validation
  setCsrfTokenCookie(response, csrfToken);
  
  return response;
}
