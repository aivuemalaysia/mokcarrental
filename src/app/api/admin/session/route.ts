import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';
import { verifyAdminSessionToken } from '@/lib/adminSession';

export async function GET() {
  const token = cookies().get(ADMIN_TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ ok: true, data: { authenticated: false } });
  const verified = await verifyAdminSessionToken(token);
  return NextResponse.json({ ok: true, data: { authenticated: verified.ok } });
}
