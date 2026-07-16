import { NextResponse } from 'next/server';
import sanitizeHtml from 'sanitize-html';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { writeAuditLog } from '@/lib/auditLog';
import { cookies } from 'next/headers';
import { validateCsrfToken } from "@/lib/csrf";
import { jsonError } from '@/lib/apiResponse';

const CONTENT_KEY = 'why_choose_us';

function formatDbError(message: string) {
  if (message.includes("Could not find the table 'public.content_sections'") || message.includes('schema cache')) {
    return "Missing table 'content_sections'. Apply Supabase migrations (004_content_sections.sql and 005_content_sections_items.sql) and run: NOTIFY pgrst, 'reload schema';";
  }
  return message;
}

function sanitize(input: string) {
  return sanitizeHtml(input, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'h3', 'h4', 'blockquote'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || '';
        const safeHref =
          href.startsWith('https://') || href.startsWith('http://') || href.startsWith('mailto:') || href.startsWith('tel:')
            ? href
            : '';
        return {
          tagName,
          attribs: {
            href: safeHref,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        };
      },
    },
  });
}

type IconKey = 'dollar' | 'smile' | 'truck' | 'headphones' | 'award' | 'check';

type WhyChooseItem = {
  icon: IconKey;
  title: string;
  description: string;
};

function parseItems(input: unknown): WhyChooseItem[] {
  if (!Array.isArray(input)) return [];
  const normalized = input
    .map((raw) => {
      const icon = typeof raw?.icon === 'string' ? raw.icon : '';
      const title = typeof raw?.title === 'string' ? raw.title.trim() : '';
      const description = typeof raw?.description === 'string' ? raw.description.trim() : '';
      if (!['dollar', 'smile', 'truck', 'headphones', 'award', 'check'].includes(icon)) return null;
      if (!title || !description) return null;
      return { icon: icon as IconKey, title, description };
    })
    .filter(Boolean) as WhyChooseItem[];
  return normalized;
}

function buildHtmlFromItems(items: WhyChooseItem[]) {
  const rows = items
    .map((i) => `<li><strong>${sanitizeHtml(i.title, { allowedTags: [], allowedAttributes: {} })}</strong> ${sanitizeHtml(i.description, { allowedTags: [], allowedAttributes: {} })}</li>`)
    .join('');
  return `<ul>${rows}</ul>`;
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
  const content_html_raw = typeof body?.content_html === 'string' ? body.content_html : '';

  if (!title) return NextResponse.json({ ok: false, error: 'Title is required.' }, { status: 400 });
  if (title.length > 120) return NextResponse.json({ ok: false, error: 'Title is too long.' }, { status: 400 });

  let content_html = '';

  if (items.length) {
    if (items.length !== 6) {
      return NextResponse.json({ ok: false, error: 'Exactly 6 items are required.' }, { status: 400 });
    }
    content_html = buildHtmlFromItems(items);
  } else {
    content_html = sanitize(content_html_raw).trim();
    const content_plain = sanitizeHtml(content_html, { allowedTags: [], allowedAttributes: {} }).trim();
    if (!content_plain) return NextResponse.json({ ok: false, error: 'Content is required.' }, { status: 400 });
    if (content_html.length > 15000) return NextResponse.json({ ok: false, error: 'Content is too long.' }, { status: 400 });
  }

  const adminEmail = request.headers.get('x-admin-email') || null;

  const payload = {
    key: CONTENT_KEY,
    title,
    content_html,
    items: items.length ? items : [],
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
    details: { titleLength: title.length, htmlLength: content_html.length, itemsCount: items.length || 0 },
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

