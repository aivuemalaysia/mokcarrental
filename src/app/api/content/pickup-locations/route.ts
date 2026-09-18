import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

const CONTENT_KEY = 'pickup_locations';

export async function GET() {
  const client = getSupabaseAdminClient();
  if (!client) {
    return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });
  }

  const { data, error } = await client
    .from('content_sections')
    .select('key,title,items,updated_at')
    .eq('key', CONTENT_KEY)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    const message = error.message || 'Unknown error';
    if (
      message.includes("Could not find the table 'public.content_sections'") ||
      message.includes('schema cache')
    ) {
      return NextResponse.json({ ok: true, data: null, warning: message });
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}
