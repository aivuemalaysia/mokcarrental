import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from '@/lib/adminApi';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function isSchemaCacheError(message: string) {
  return message.includes('schema cache');
}

async function tryReloadSchemaCache(client: any) {
  const { error } = await client.rpc('pgrst_reload_schema');
  if (error) return { ok: false as const, error: error.message || 'Unknown error' };
  return { ok: true as const };
}

async function insertCarWithRetry(client: any, payload: Record<string, unknown>) {
  const attempt = () => (client.from('cars') as any).insert([payload as any]).select('*').single();
  let res = await attempt();
  if (res.error && isSchemaCacheError(res.error.message || '')) {
    const reload = await tryReloadSchemaCache(client);
    if (reload.ok) res = await attempt();
  }
  return res;
}

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const { data, error } = await client.from('cars').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, data });
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const payload = { ...(body as Record<string, unknown>) } as Record<string, unknown>;
  if (payload.status === 'available') payload.available = true;
  if (payload.status === 'unavailable' || payload.status === 'maintenance') payload.available = false;

  const { data, error } = await insertCarWithRetry(client, payload);
  if (error) {
    const message = error.message || 'Unknown error';
    const enriched =
      message.includes("Could not find the 'status' column of 'cars'") ||
      message.includes('column cars.status does not exist')
        ? `${message}. Apply DB migration 003/009 and refresh PostgREST schema cache (NOTIFY pgrst, 'reload schema').`
        : message;
    return NextResponse.json({ ok: false, error: enriched }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data }, { status: 201 });
}
