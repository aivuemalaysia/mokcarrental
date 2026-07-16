import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { writeAuditLog } from '@/lib/auditLog';
import { cookies } from 'next/headers';
import { validateCsrfToken } from "@/lib/csrf";
import { jsonError } from '@/lib/apiResponse';

const CONTENT_KEY = 'pickup_locations';

function formatDbError(message: string) {
  if (message.includes("Could not find the table 'public.content_sections'") || message.includes('schema cache')) {
    return "Missing table 'content_sections'. Apply Supabase migrations (004_content_sections.sql and 005_content_sections_items.sql) and run: NOTIFY pgrst, 'reload schema';";
  }
  return message;
}

type PickupLocationItem = {
  id: string;
  label: string;
};

function parseItems(input: unknown): PickupLocationItem[] {
  if (!Array.isArray(input)) return [];
  const normalized = input
    .map((raw) => {
      const id = typeof raw?.id === 'string' ? raw.id.trim() : '';
      const label = typeof raw?.label === 'string' ? raw.label.trim() : '';
      if (!id || !label) return null;
      if (id.length > 80 || label.length > 120) return null;
      return { id, label };
    })
    .filter(Boolean) as PickupLocationItem[];

  const seen = new Set<string>();
  for (const item of normalized) {
    if (seen.has(item.id)) return [];
    seen.add(item.id);
  }
  return normalized;
}

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const { data, error } = await client.from('content_sections').select('*').eq('key', CONTENT_KEY).maybeSingle();
  if (error) return NextResponse.json({ ok: false, error: formatDbError(error.message || 'Unknown error') }, { status: 500 });

  return NextResponse.json({ ok: true, data });
}

export async function PUT(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const body = await request.json().catch(() => null);
  // CSRF protection
  const cookieStore = cookies();
  const csrfValid = await validateCsrfToken(request, cookieStore);
  if (!csrfValid) {
    return jsonError('Invalid CSRF token', 403);
  }
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const items = parseItems(body?.items);

  if (!title) return NextResponse.json({ ok: false, error: 'Title is required.' }, { status: 400 });
  if (title.length > 120) return NextResponse.json({ ok: false, error: 'Title is too long.' }, { status: 400 });
  if (!items.length) return NextResponse.json({ ok: false, error: 'At least 1 pickup location is required.' }, { status: 400 });
  if (items.length > 20) return NextResponse.json({ ok: false, error: 'Too many pickup locations (max 20).' }, { status: 400 });

  const adminEmail = request.headers.get('x-admin-email') || null;

  const payload = {
    key: CONTENT_KEY,
    title,
    content_html: null,
    items,
    updated_by_email: adminEmail,
    deleted_at: null,
    deleted_by_email: null,
  };

  const { data, error } = await client
    .from('content_sections')
    .upsert(payload, { onConflict: 'key' })
    .select('*')
    .single();

  if (error) return NextResponse.json({ ok: false, error: formatDbError(error.message || 'Unknown error') }, { status: 500 });

  await writeAuditLog({
    action: 'update',
    resourceType: 'content_section',
    resourceId: CONTENT_KEY,
    details: { titleLength: title.length, itemsCount: items.length },
    request,
    userEmail: adminEmail || undefined,
  });

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const adminEmail = request.headers.get('x-admin-email') || null;

  const { data, error } = await client
    .from('content_sections')
    .update({ deleted_at: new Date().toISOString(), deleted_by_email: adminEmail })
    .eq('key', CONTENT_KEY)
    .select('*')
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: formatDbError(error.message || 'Unknown error') }, { status: 500 });

  await writeAuditLog({
    action: 'soft_delete',
    resourceType: 'content_section',
    resourceId: CONTENT_KEY,
    details: {},
    request,
    userEmail: adminEmail || undefined,
  });

  return NextResponse.json({ ok: true, data });
}


