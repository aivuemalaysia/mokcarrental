import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { writeAuditLog } from '@/lib/auditLog';
import { cookies } from 'next/headers';
import { validateCsrfToken } from "@/lib/csrf";
import { jsonError } from '@/lib/apiResponse';

const CONTENT_KEY = 'site_settings';

function formatDbError(message: string) {
  if (message.includes("Could not find the table 'public.content_sections'") || message.includes('schema cache')) {
    return "Missing table 'content_sections'. Apply Supabase migrations (004_content_sections.sql and 005_content_sections_items.sql) and run: NOTIFY pgrst, 'reload schema';";
  }
  return message;
}

function normalizeString(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}

function normalizeOptionalString(v: unknown) {
  const s = normalizeString(v);
  return s ? s : '';
}

function normalizeBoolean(v: unknown, fallback: boolean) {
  return typeof v === 'boolean' ? v : fallback;
}

type SiteSettingsPayload = {
  businessName: string;
  whatsappNumber: string;
  email: string;
  address: string;
  workingHours: string;
  currency: string;
  timezone: string;
  facebookUrl: string;
  instagramUrl: string;
  mapsEmbedUrl: string;
  siteUrl: string;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  autoConfirm: boolean;
};

function parseSettings(input: unknown): SiteSettingsPayload | null {
  const raw = input && typeof input === 'object' ? (input as any) : null;
  if (!raw) return null;

  const businessName = normalizeString(raw.businessName);
  const whatsappNumber = normalizeString(raw.whatsappNumber);
  const email = normalizeString(raw.email);
  const address = normalizeOptionalString(raw.address);
  const workingHours = normalizeOptionalString(raw.workingHours);
  const currency = normalizeOptionalString(raw.currency);
  const timezone = normalizeOptionalString(raw.timezone);
  const facebookUrl = normalizeOptionalString(raw.facebookUrl);
  const instagramUrl = normalizeOptionalString(raw.instagramUrl);
  const mapsEmbedUrl = normalizeOptionalString(raw.mapsEmbedUrl);
  const siteUrl = normalizeOptionalString(raw.siteUrl);

  const emailNotifications = normalizeBoolean(raw.emailNotifications, true);
  const whatsappNotifications = normalizeBoolean(raw.whatsappNotifications, true);
  const autoConfirm = normalizeBoolean(raw.autoConfirm, false);

  if (!businessName) return null;
  if (!whatsappNumber) return null;
  if (!email) return null;

  if (businessName.length > 120) return null;
  if (whatsappNumber.length > 60) return null;
  if (email.length > 160) return null;
  if (address.length > 400) return null;
  if (workingHours.length > 120) return null;
  if (currency.length > 16) return null;
  if (timezone.length > 64) return null;
  if (facebookUrl.length > 300) return null;
  if (instagramUrl.length > 300) return null;
  if (mapsEmbedUrl.length > 2000) return null;
  if (siteUrl.length > 300) return null;

  return {
    businessName,
    whatsappNumber,
    email,
    address,
    workingHours,
    currency,
    timezone,
    facebookUrl,
    instagramUrl,
    mapsEmbedUrl,
    siteUrl,
    emailNotifications,
    whatsappNotifications,
    autoConfirm,
  };
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
  const settings = parseSettings(body);
  if (!settings) {
    return NextResponse.json({ ok: false, error: 'Invalid settings payload.' }, { status: 400 });
  }

  const adminEmail = request.headers.get('x-admin-email') || null;

  const payload = {
    key: CONTENT_KEY,
    title: 'Site Settings',
    content_html: null,
    items: settings,
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
    details: { keys: Object.keys(settings) },
    request,
    userEmail: adminEmail || undefined,
  });

  return NextResponse.json({ ok: true, data });
}


