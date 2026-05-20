import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const CONTENT_KEY = 'why_choose_us';

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const client = getPublicClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const { data, error } = await client
    .from('content_sections')
    .select('key,title,items,content_html,updated_at')
    .eq('key', CONTENT_KEY)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    const message = error.message || 'Unknown error';
    if (message.includes("Could not find the table 'public.content_sections'") || message.includes('schema cache')) {
      return NextResponse.json({ ok: true, data: null, warning: message });
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data });
}
