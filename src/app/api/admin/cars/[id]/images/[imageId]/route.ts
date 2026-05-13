import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

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

export async function DELETE(request: Request, { params }: { params: { id: string; imageId: string } }) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const bucketName = await resolveBucketName(client);

  const { data: row, error: readErr } = await client
    .from('car_images')
    .select('*')
    .eq('id', params.imageId)
    .eq('car_id', params.id)
    .maybeSingle();

  if (readErr) return NextResponse.json({ ok: false, error: normalizeSchemaCacheError(readErr.message) }, { status: 500 });
  if (!row) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  await client.storage.from(bucketName).remove([row.original_path, row.medium_path, row.thumb_path]);
  const { error: delErr } = await client.from('car_images').delete().eq('id', params.imageId).eq('car_id', params.id);
  if (delErr) return NextResponse.json({ ok: false, error: normalizeSchemaCacheError(delErr.message) }, { status: 500 });

  await updateCarsImageFields(client, params.id);
  console.info('IK: Deleted car image', { carId: params.id, imageId: params.imageId });

  return NextResponse.json({ ok: true, data: { deleted: true } });
}

