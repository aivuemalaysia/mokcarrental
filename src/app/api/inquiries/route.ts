import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jsonError, jsonOk } from '@/lib/apiResponse';
import { rateLimit } from '@/lib/rateLimit';
import { validateInquiryCreateInput } from '@/lib/validation/inquiry';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: Request) {
  const client = getAdminClient();
  if (!client) return jsonError('Server misconfigured', 500);

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const limited = rateLimit({ key: `inquiries:${ip}`, limit: 20, windowMs: 60_000 });
  if (!limited.ok) return jsonError('Too many requests', 429);

  const body = await request.json().catch(() => null);
  const validated = validateInquiryCreateInput(body);
  if (!validated.ok) return jsonError(validated.error, 400);

  const { data, error } = await (client.from('inquiries') as any).insert([validated.value as any]).select('*').single();
  if (error) return jsonError(error.message, 500);

  const inquiryId = (data as any)?.id || null;
  const event = await (client.from('inquiries_events') as any)
    .insert([{ event_type: 'inquiry_created', inquiry_id: inquiryId }])
    .select('id')
    .single();
  if (event.error) {
    console.error('IK: inquiries_events insert failed', event.error);
  }

  return jsonOk(data, { status: 201 });
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
