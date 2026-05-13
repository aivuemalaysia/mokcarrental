import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';

export async function GET() {
  const token = cookies().get(ADMIN_TOKEN_COOKIE)?.value;
  return NextResponse.json({ authenticated: Boolean(token) });
}
