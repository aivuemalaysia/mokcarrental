import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';
import { getAdminRedirect } from '@/lib/adminRouting';
import { verifyAdminSessionToken } from '@/lib/adminSession';

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data: https://fonts.gstatic.com; " +
    "connect-src 'self' https://suksakybghzumjkzfshj.supabase.co wss://suksakybghzumjkzfshj.supabase.co ws://suksakybghzumjkzfshj.supabase.co; " +
    "frame-src 'self' https://www.google.com https://www.google.com/maps/embed; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests"
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value || '';
  const verified = token ? await verifyAdminSessionToken(token) : { ok: false as const };
  const hasToken = verified.ok;
  const redirectTo = getAdminRedirect(pathname, hasToken);

  if (!redirectTo) return addSecurityHeaders(NextResponse.next());

  if (redirectTo === '/admin/login' && pathname !== '/admin/login') {
    console.warn(
      'ADMIN_AUTH_REDIRECT',
      JSON.stringify({ pathname, ua: request.headers.get('user-agent') })
    );
  }

  const anyNextUrl = request.nextUrl as any;
  const url =
    typeof anyNextUrl?.clone === 'function'
      ? anyNextUrl.clone()
      : new URL(request.nextUrl.toString());

  url.pathname = redirectTo;
  return addSecurityHeaders(NextResponse.redirect(url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
