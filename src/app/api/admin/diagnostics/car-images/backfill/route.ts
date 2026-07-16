import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';
import { validateCsrfToken } from "@/lib/csrf";
import { jsonError } from '@/lib/apiResponse';

const DEFAULT_BUCKET = 'car-images';
const LEGACY_BUCKET = 'car-image';

function normalizeSchemaCacheError(message: string) {
  if (message.includes("Could not find the table 'public.car_images' in the schema cache")) {
    return "Database table 'car_images' is missing (or PostgREST schema cache is stale). Apply migration 007_car_images.sql then run NOTIFY pgrst, 'reload schema'.";
  }
  return message;
}

function parseSupabasePublicObjectUrl(url: string, supabaseUrl: string) {
  try {
    const u = new URL(url);
    const base = new URL(supabaseUrl);
    if (u.hostname !== base.hostname) return null;
    const prefix = '/storage/v1/object/public/';
    if (!u.pathname.startsWith(prefix)) return null;
    const rest = u.pathname.slice(prefix.length);
    const parts = rest.split('/').filter(Boolean);
    if (!parts.length) return null;
    const bucket = parts[0];
    const path = parts.slice(1).join('/');
    if (!bucket || !path) return null;
    return { bucket, path };
  } catch {
    return null;
  }
}

function guessContentTypeFromPath(path: string) {
  const lower = path.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

async function resolveBucketName(client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>) {
  const explicit = process.env.SUPABASE_CAR_IMAGES_BUCKET;
  if (explicit) return explicit;

  const { data, error } = await client.storage.listBuckets();
  if (error) return DEFAULT_BUCKET;

  const names = new Set((data || []).map((b) => b.name));
  if (names.has(DEFAULT_BUCKET)) return DEFAULT_BUCKET;
  if (names.has(LEGACY_BUCKET)) return LEGACY_BUCKET;
  return DEFAULT_BUCKET;
}

async function findVariantPaths({
  client,
  bucket,
  path,
}: {
  client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>;
  bucket: string;
  path: string;
}) {
  const baseDir = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
  if (!baseDir) {
    return { original_path: path, medium_path: path, thumb_path: path };
  }

  const { data } = await client.storage.from(bucket).list(baseDir, { limit: 50 });
  const names = (data || []).map((f: any) => String(f?.name || '')).filter(Boolean);

  const originalName = names.find((n) => n.startsWith('original.'));
  const mediumName = names.find((n) => n === 'medium.webp');
  const thumbName = names.find((n) => n === 'thumb.webp');

  const original_path = originalName ? `${baseDir}/${originalName}` : path;
  const medium_path = mediumName ? `${baseDir}/${mediumName}` : path;
  const thumb_path = thumbName ? `${baseDir}/${thumbName}` : path;

  return { original_path, medium_path, thumb_path };
}

async function updateCarsImageFields(client: ReturnType<typeof getSupabaseAdminClient>, carId: string) {
  if (!client) return;
  const { data } = await client
    .from('car_images')
    .select('medium_url,sort_order')
    .eq('car_id', carId)
    .order('sort_order', { ascending: true });

  const mediums = (data || []).map((r) => r.medium_url);
  const image = mediums[0] || null;
  await client.from('cars').update({ image, images: mediums }).eq('id', carId);
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!supabaseUrl) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const body = await request.json().catch(() => null);
  // CSRF protection
  const cookieStore = cookies();
  const csrfValid = await validateCsrfToken(request, cookieStore);
  if (!csrfValid) {
    return jsonError('Invalid CSRF token', 403);
  }
  const onlyCarId = typeof body?.carId === 'string' ? body.carId : '';
  const limit = typeof body?.limit === 'number' && Number.isFinite(body.limit) ? Math.max(1, Math.min(500, body.limit)) : 200;

  const resolvedBucket = await resolveBucketName(client);

  const carsQuery = client.from('cars').select('id,image,images').order('created_at', { ascending: false }).limit(limit);
  const { data: cars, error: carsErr } = onlyCarId ? await carsQuery.eq('id', onlyCarId) : await carsQuery;
  if (carsErr) return NextResponse.json({ ok: false, error: carsErr.message }, { status: 500 });

  let carsProcessed = 0;
  let carsSkippedExisting = 0;
  let imagesInserted = 0;
  let urlsSkipped = 0;

  for (const car of cars || []) {
    carsProcessed += 1;
    const carId = String((car as any).id || '');
    if (!carId) continue;

    const { count, error: countErr } = await client
      .from('car_images')
      .select('id', { count: 'exact', head: true })
      .eq('car_id', carId);
    if (countErr) {
      return NextResponse.json({ ok: false, error: normalizeSchemaCacheError(countErr.message) }, { status: 500 });
    }
    if ((count || 0) > 0) {
      carsSkippedExisting += 1;
      continue;
    }

    const urls = new Set<string>();
    const primary = typeof (car as any).image === 'string' ? (car as any).image : '';
    if (primary) urls.add(primary);
    const gallery = Array.isArray((car as any).images) ? (car as any).images : [];
    for (const u of gallery) if (typeof u === 'string' && u) urls.add(u);

    let sort = 0;
    for (const url of Array.from(urls)) {
      const parsed = parseSupabasePublicObjectUrl(url, supabaseUrl);
      if (!parsed) {
        urlsSkipped += 1;
        continue;
      }

      const bucket = parsed.bucket || resolvedBucket;
      const { original_path, medium_path, thumb_path } = await findVariantPaths({
        client,
        bucket,
        path: parsed.path,
      });

      const original_url = client.storage.from(bucket).getPublicUrl(original_path).data.publicUrl;
      const medium_url = client.storage.from(bucket).getPublicUrl(medium_path).data.publicUrl;
      const thumb_url = client.storage.from(bucket).getPublicUrl(thumb_path).data.publicUrl;

      const { error: insertErr } = await client.from('car_images').insert({
        car_id: carId,
        sort_order: sort,
        original_path,
        medium_path,
        thumb_path,
        original_url,
        medium_url,
        thumb_url,
        width: 0,
        height: 0,
        bytes: 0,
        content_type: guessContentTypeFromPath(original_path),
        sha256: crypto.randomBytes(32).toString('hex'),
        metadata: { backfilledFrom: url },
      });

      if (insertErr) {
        return NextResponse.json({ ok: false, error: normalizeSchemaCacheError(insertErr.message) }, { status: 500 });
      }

      imagesInserted += 1;
      sort += 1;
    }

    if (sort > 0) {
      await updateCarsImageFields(client, carId);
    }
  }

  return NextResponse.json({
    ok: true,
    data: {
      resolvedBucket,
      carsProcessed,
      carsSkippedExisting,
      imagesInserted,
      urlsSkipped,
    },
  });
}

