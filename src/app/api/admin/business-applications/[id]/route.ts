import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { writeAuditLog } from '@/lib/auditLog';
import { cookies } from 'next/headers';
import { validateCsrfToken } from "@/lib/csrf";

function normalizeSchemaCacheError(message: string) {
  if (message.includes("Could not find the table 'public.business_applications' in the schema cache")) {
    return "Database table 'business_applications' is missing (or PostgREST schema cache is stale). Apply Supabase migration 014_business_applications.sql, then reload the schema (Admin API: POST /api/admin/diagnostics/reload-schema).";
  }
  if (message.includes("Could not find the table 'public.business_application_images' in the schema cache")) {
    return "Database table 'business_application_images' is missing (or PostgREST schema cache is stale). Apply Supabase migration 014_business_applications.sql, then reload the schema (Admin API: POST /api/admin/diagnostics/reload-schema).";
  }
  return message;
}

function normalizeText(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const { data: app, error: appError } = await client.from('business_applications').select('*').eq('id', params.id).maybeSingle();
  if (appError) {
    return NextResponse.json(
      { ok: false, error: normalizeSchemaCacheError(appError.message || 'Failed to load application') },
      { status: 500 }
    );
  }
  if (!app) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const { data: images, error: imagesError } = await client
    .from('business_application_images')
    .select('*')
    .eq('application_id', params.id)
    .order('sort_order', { ascending: true });

  if (imagesError) {
    return NextResponse.json(
      { ok: false, error: normalizeSchemaCacheError(imagesError.message || 'Failed to load images') },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data: { application: app, images: images || [] } });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  // CSRF protection
  const cookieStore = cookies();
  const csrfValid = await validateCsrfToken(request, cookieStore);
  if (!csrfValid) {
    return NextResponse.json({ ok: false, error: 'Invalid CSRF token' }, { status: 403 });
  }

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const body = await request.json().catch(() => null);
  const status = normalizeText(body?.status);
  const adminNotes = normalizeText(body?.adminNotes);
  const adminEmail = request.headers.get('x-admin-email') || null;

  if (status !== 'pending' && status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ ok: false, error: 'Invalid status.' }, { status: 400 });
  }

  if (adminNotes.length > 2000) {
    return NextResponse.json({ ok: false, error: 'Admin notes is too long.' }, { status: 400 });
  }

  const { data, error } = await client
    .from('business_applications')
    .update({ status, admin_notes: adminNotes || null })
    .eq('id', params.id)
    .select('*')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: normalizeSchemaCacheError(error.message || 'Failed to update') }, { status: 500 });
  }
  if (!data) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  await writeAuditLog({
    action: 'update',
    resourceType: 'business_application',
    resourceId: params.id,
    details: { status, hasAdminNotes: Boolean(adminNotes) },
    request,
    userEmail: adminEmail || undefined,
  });

  return NextResponse.json({ ok: true, data });
}
