import { randomBytes } from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function setCsrfTokenCookie(response: any, token?: string) {
  const csrfToken = token || generateCsrfToken();
  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return csrfToken;
}

export async function validateCsrfToken(request: Request, cookieStore: any): Promise<boolean> {
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get('x-csrf-token');
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  return cookieToken === headerToken;
}
