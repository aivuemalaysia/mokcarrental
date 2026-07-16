import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

function normalizeSchemaCacheError(message: string) {
  if (message.includes("Could not find the table 'public.business_applications' in the schema cache")) {
    return "Database table 'business_applications' is missing (or PostgREST schema cache is stale). Apply Supabase migration 014_business_applications.sql, then reload the schema (Admin API: POST /api/admin/diagnostics/reload-schema).";
  }
  return message;
}

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const url = new URL(request.url);
  const statusRaw = url.searchParams.get('status') || '';
  const limitRaw = url.searchParams.get('limit') || '';

  let query = client.from('business_applications').select('*').order('created_at', { ascending: false });

  if (statusRaw === 'pending' || statusRaw === 'approved' || statusRaw === 'rejected') {
    query = query.eq('status', statusRaw);
  }

  const limit = Number(limitRaw);
  if (Number.isFinite(limit) && limit > 0) {
    query = query.limit(Math.min(limit, 200));
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json(
      { ok: false, error: normalizeSchemaCacheError(error.message || 'Failed to load applications') },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data });
}


