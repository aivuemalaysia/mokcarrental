import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';
import { verifyAdminSessionToken } from '@/lib/adminSession';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const token = cookies().get(ADMIN_TOKEN_COOKIE)?.value;
  const ok = token ? (await verifyAdminSessionToken(token)).ok : false;
  if (!ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);
  const offset = Number(searchParams.get('offset')) || 0;

  const client = getSupabaseAdminClient();
  if (!client) {
    return NextResponse.json({ ok: true, data: [], total: 0 });
  }

  try {
    const { data, error, count } = await client
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('IK:AUDIT_LOG_FETCH_ERROR', error.message);
      return NextResponse.json({ ok: true, data: [], total: 0 });
    }

    return NextResponse.json({ ok: true, data: data || [], total: count || 0 });
  } catch (err) {
    console.error('IK:AUDIT_LOG_FETCH_THROW', err);
    return NextResponse.json({ ok: true, data: [], total: 0 });
  }
}
