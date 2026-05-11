import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin/* routes except /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Check for admin token in cookies or headers
    // Since we use localStorage for auth (client-side), we can't easily check in middleware
    // but we can at least ensure we're not blocking public routes.
    
    // For now, we'll let the client-side AdminLayout handle the redirect
    // as we don't have server-side session management yet.
    return NextResponse.next();
  }

  // Explicitly allow public access to all other routes
  return NextResponse.next();
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
