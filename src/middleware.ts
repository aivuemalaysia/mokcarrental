import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';
import { getAdminRedirect } from '@/lib/adminRouting';
import { verifyAdminSessionToken } from '@/lib/adminSession';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value || '';
  const verified = token ? await verifyAdminSessionToken(token) : { ok: false as const };
  const hasToken = verified.ok;
  const redirectTo = getAdminRedirect(pathname, hasToken);

  if (!redirectTo) return NextResponse.next();

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
  return NextResponse.redirect(url);
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
