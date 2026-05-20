import { NextResponse } from 'next/server';
import { ADMIN_TOKEN_COOKIE, getAdminAuthDebugInfo, isValidAdminCredentials } from '@/lib/adminAuth';
import { jsonError, jsonOk } from '@/lib/apiResponse';
import { createAdminSessionToken } from '@/lib/adminSession';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const normalizedEmail = email.trim().toLowerCase();

  const passwordOk =
    password.length >= 6 &&
    password.length <= 128 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password);
  if (!passwordOk) {
    console.warn(
      'IK:ADMIN_LOGIN_INVALID_INPUT',
      JSON.stringify({ email: normalizedEmail, nodeEnv: process.env.NODE_ENV }),
    );
    return jsonError('Invalid input', 400);
  }

  const ok = await isValidAdminCredentials(email, password);
  if (!ok) {
    console.warn(
      'IK:ADMIN_LOGIN_DENIED',
      JSON.stringify({ email: normalizedEmail, ...getAdminAuthDebugInfo() }),
    );
    return jsonError('Invalid email or password', 401);
  }

  let token = '';
  try {
    token = await createAdminSessionToken(normalizedEmail);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server misconfigured';
    console.error(
      'IK:ADMIN_LOGIN_TOKEN_ERROR',
      JSON.stringify({ email: normalizedEmail, message }),
    );
    return jsonError(message, 500);
  }
  const response = jsonOk({ user: { email: normalizedEmail, name: 'Admin' } });
  response.cookies.set(ADMIN_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
