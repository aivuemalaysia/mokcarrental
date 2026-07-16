import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminSession } from '@/lib/adminApi';
import { DEFAULT_MIN_IMAGES_PER_CAR } from '@/lib/carImageConstraints';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function isSchemaCacheError(message: string) {
  return message.includes('schema cache');
}

function normalizeSchemaCacheError(message: string) {
  if (message.includes("Could not find the table 'public.car_images' in the schema cache")) {
    return "Database table 'car_images' is missing (or PostgREST schema cache is stale). Apply migration 007_car_images.sql then run NOTIFY pgrst, 'reload schema'.";
  }
  return message;
}

async function tryReloadSchemaCache(client: any) {
  const { error } = await client.rpc('pgrst_reload_schema');
  if (error) return { ok: false as const, error: error.message || 'Unknown error' };
  return { ok: true as const };
}

async function updateCarWithRetry(
  client: any,
  id: string,
  payload: Record<string, unknown>,
) {
  const attempt = () => (client.from('cars') as any).update(payload as any).eq('id', id).select('*').single();
  let res = await attempt();
  if (res.error && isSchemaCacheError(res.error.message || '')) {
    const reload = await tryReloadSchemaCache(client);
    if (reload.ok) res = await attempt();
  }
  return res;
}

export async function PUT(request: Request, ctx: { params: { id: string } }) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const body = await request.json()
  // CSRF protection
  const cookieStore = cookies();
  const csrfValid = await validateCsrfToken(request, cookieStore);
  if (!csrfValid) {
    return jsonError('Invalid CSRF token', 403);
  }
.catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  const payload = { ...(body as Record<string, unknown>) } as Record<string, unknown>;
  if (payload.status === 'available') payload.available = true;
  if (payload.status === 'unavailable' || payload.status === 'maintenance') payload.available = false;

  const requestedAvailable = payload.available === true;
  const requestedFeatured = payload.featured === true;
  if (requestedAvailable || requestedFeatured) {
    const { data: current, error: currentErr } = await client
      .from('cars')
      .select('available,featured')
      .eq('id', ctx.params.id)
      .maybeSingle();

    if (currentErr) {
      return NextResponse.json({ ok: false, error: currentErr.message || 'Failed to load car.' }, { status: 500 });
    }

    const isTransitionToAvailable = requestedAvailable && !(current as any)?.available;
    const isTransitionToFeatured = requestedFeatured && !(current as any)?.featured;

    if (isTransitionToAvailable || isTransitionToFeatured) {
      const { count, error: countErr } = await client
        .from('car_images')
        .select('id', { count: 'exact', head: true })
        .eq('car_id', ctx.params.id);

      if (countErr) {
        return NextResponse.json({ ok: false, error: normalizeSchemaCacheError(countErr.message) }, { status: 500 });
      }

      const imageCount = typeof count === 'number' ? count : 0;
      if (imageCount < DEFAULT_MIN_IMAGES_PER_CAR) {
        return NextResponse.json(
          { ok: false, error: `Please upload at least ${DEFAULT_MIN_IMAGES_PER_CAR} images before making this listing visible.` },
          { status: 400 },
        );
      }
    }
  }

  const { data, error } = await updateCarWithRetry(client, ctx.params.id, payload);
  if (error) {
    const message = error.message || 'Unknown error';
    const enriched =
      message.includes("Could not find the 'status' column of 'cars'") ||
      message.includes('column cars.status does not exist')
        ? `${message}. Apply DB migration 003/009 and refresh PostgREST schema cache (NOTIFY pgrst, 'reload schema').`
        : message;
    return NextResponse.json({ ok: false, error: enriched }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(request: Request, ctx: { params: { id: string } }) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const { error: inquiriesDeleteError } = await (client.from('inquiries') as any).delete().eq('car_id', ctx.params.id);
  if (inquiriesDeleteError) {
    return NextResponse.json({ ok: false, error: inquiriesDeleteError.message }, { status: 500 });
  }

  const { error } = await (client.from('cars') as any).delete().eq('id', ctx.params.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

