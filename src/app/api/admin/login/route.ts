import { NextResponse } from 'next/server';
import { ADMIN_TOKEN_COOKIE, getAdminAuthDebugInfo, isValidAdminCredentials } from '@/lib/adminAuth';
import { jsonError, jsonOk } from '@/lib/apiResponse';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { createAdminSessionToken } from '@/lib/adminSession';

const MAX_LOGIN_ATTEMPTS = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

async function checkLoginRateLimit(ip: string): Promise<{ ok: boolean; remaining: number }> {
  try {
    const client = getSupabaseAdminClient();
    if (!client) return { ok: true, remaining: 999 };
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error } = await client
      .from('login_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .eq('attempt_type', 'admin_login')
      .eq('success', false)
      .gte('created_at', since);
    if (error) return { ok: true, remaining: 999 };
    const attempts = count || 0;
    return { ok: attempts < MAX_LOGIN_ATTEMPTS, remaining: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts) };
  } catch {
    return { ok: true, remaining: 999 };
  }
}

async function recordLoginAttempt(ip: string, email: string, success: boolean) {
  try {
    const client = getSupabaseAdminClient();
    if (!client) return;
    await client.from('login_attempts').insert({
      ip_address: ip,
      attempt_type: 'admin_login',
      email,
      success,
    });
  } catch {
    // Non-critical; don't block login
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const rateCheck = await checkLoginRateLimit(ip);
  if (!rateCheck.ok) {
    console.warn('IK:ADMIN_LOGIN_RATE_LIMITED', JSON.stringify({ ip }));
    return jsonError('Too many login attempts. Try again in 15 minutes.', 429);
  }

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
    await recordLoginAttempt(ip, normalizedEmail, false);
    return jsonError('Invalid email or password', 401);
  }

  await recordLoginAttempt(ip, normalizedEmail, true);
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
