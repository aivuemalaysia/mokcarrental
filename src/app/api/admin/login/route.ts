import { NextResponse } from 'next/server';
import { ADMIN_TOKEN_COOKIE, createAdminToken, isValidAdminCredentials } from '@/lib/adminAuth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!isValidAdminCredentials(email, password)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = createAdminToken();
  const response = NextResponse.json({ user: { email, name: 'Admin' } });
  response.cookies.set(ADMIN_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
