import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';
import { verifyAdminSessionToken } from '@/lib/adminSession';

export async function GET() {
  const token = cookies().get(ADMIN_TOKEN_COOKIE)?.value;
  const ok = token ? (await verifyAdminSessionToken(token)).ok : false;
  if (!ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({ ok: true, data: [] });
}
