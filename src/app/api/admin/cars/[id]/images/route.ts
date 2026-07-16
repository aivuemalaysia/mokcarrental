import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { getFileExtFromContentType, processCarImage } from '@/lib/carImages';
import { CarImageConstraintError, DEFAULT_MAX_FILES_PER_UPLOAD } from '@/lib/carImageConstraints';

const DEFAULT_BUCKET = 'car-images';
const LEGACY_BUCKET = 'car-image';

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

function normalizeStorageBucketError(message: string, bucketName: string) {
  if (message.toLowerCase().includes('bucket not found')) {
    return `Storage bucket not found: "${bucketName}". Create it in Supabase Storage or set SUPABASE_CAR_IMAGES_BUCKET.`;
  }
  return message;
}

function normalizeSchemaCacheError(message: string) {
  if (message.includes("Could not find the table 'public.car_images' in the schema cache")) {
    return "Database table 'car_images' is missing (or PostgREST schema cache is stale). Apply migration 007_car_images.sql then run NOTIFY pgrst, 'reload schema'.";
  }
  return message;
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
  await client
    .from('cars')
    .update({ image, images: mediums })
    .eq('id', carId);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const { data, error } = await client
    .from('car_images')
    .select('*')
    .eq('car_id', params.id)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ ok: false, error: normalizeSchemaCacheError(error.message) }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  try {
    const bucketName = await resolveBucketName(client);
    const form = await request.formData().catch(() => null);
    if (!form) return NextResponse.json({ ok: false, error: 'Invalid form data' }, { status: 400 });

    const files = form.getAll('files').filter(Boolean);
    if (!files.length) return NextResponse.json({ ok: false, error: 'No files uploaded' }, { status: 400 });
    if (files.length > DEFAULT_MAX_FILES_PER_UPLOAD)
      return NextResponse.json(
        { ok: false, error: `Too many files (max ${DEFAULT_MAX_FILES_PER_UPLOAD} per upload)` },
        { status: 400 },
      );

    const { data: maxRow } = await client
      .from('car_images')
      .select('sort_order')
      .eq('car_id', params.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    const baseSort = typeof maxRow?.sort_order === 'number' ? maxRow.sort_order + 1 : 0;

    const inserted: any[] = [];

    for (let idx = 0; idx < files.length; idx += 1) {
      const file = files[idx] as File;
      if (!file || typeof (file as any).arrayBuffer !== 'function') {
        return NextResponse.json({ ok: false, error: 'Invalid file' }, { status: 400 });
      }

      const contentType = file.type || '';
      const buf = Buffer.from(await file.arrayBuffer());

      const processed = await processCarImage(buf, contentType);
      const ext = getFileExtFromContentType(processed.original.contentType);

      const imageId = randomUUID();
      const basePath = `cars/${params.id}/${imageId}`;

      const originalPath = `${basePath}/original.${ext}`;
      const mediumPath = `${basePath}/medium.webp`;
      const thumbPath = `${basePath}/thumb.webp`;

      const cleanupPaths: string[] = [];

      const originalUpload = await client.storage.from(bucketName).upload(originalPath, processed.original.buffer, {
        contentType: processed.original.contentType,
        upsert: false,
      });
      if (originalUpload.error) throw new Error(normalizeStorageBucketError(originalUpload.error.message, bucketName));
      cleanupPaths.push(originalPath);

      const mediumUpload = await client.storage.from(bucketName).upload(mediumPath, processed.medium.buffer, {
        contentType: processed.medium.contentType,
        upsert: false,
      });
      if (mediumUpload.error) throw new Error(normalizeStorageBucketError(mediumUpload.error.message, bucketName));
      cleanupPaths.push(mediumPath);

      const thumbUpload = await client.storage.from(bucketName).upload(thumbPath, processed.thumb.buffer, {
        contentType: processed.thumb.contentType,
        upsert: false,
      });
      if (thumbUpload.error) throw new Error(normalizeStorageBucketError(thumbUpload.error.message, bucketName));
      cleanupPaths.push(thumbPath);

      const originalUrl = client.storage.from(bucketName).getPublicUrl(originalPath).data.publicUrl;
      const mediumUrl = client.storage.from(bucketName).getPublicUrl(mediumPath).data.publicUrl;
      const thumbUrl = client.storage.from(bucketName).getPublicUrl(thumbPath).data.publicUrl;

      const payload = {
        car_id: params.id,
        sort_order: baseSort + idx,
        original_path: originalPath,
        medium_path: mediumPath,
        thumb_path: thumbPath,
        original_url: originalUrl,
        medium_url: mediumUrl,
        thumb_url: thumbUrl,
        width: processed.original.width,
        height: processed.original.height,
        bytes: processed.original.bytes,
        content_type: processed.original.contentType,
        sha256: processed.original.sha256,
        metadata: processed.original.metadata,
      };

      const { data: row, error } = await client.from('car_images').insert(payload).select('*').single();
      if (error) {
        await client.storage.from(bucketName).remove(cleanupPaths);
        throw new Error(normalizeSchemaCacheError(error.message));
      }
      inserted.push(row);
    }

    await updateCarsImageFields(client, params.id);

    console.info('IK: Uploaded car images', { carId: params.id, count: inserted.length });
    return NextResponse.json({ ok: true, data: inserted }, { status: 201 });
  } catch (e: any) {
    const message = typeof e?.message === 'string' ? normalizeSchemaCacheError(e.message) : 'Upload failed';
    if (e instanceof CarImageConstraintError) {
      return NextResponse.json({ ok: false, error: message }, { status: e.status || 400 });
    }
    console.error('IK: Upload car images error', e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}


