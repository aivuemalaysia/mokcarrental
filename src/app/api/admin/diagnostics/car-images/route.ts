import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

const DEFAULT_BUCKET = 'car-images';
const LEGACY_BUCKET = 'car-image';

function normalizeSchemaCacheError(message: string) {
  if (message.includes("Could not find the table 'public.car_images' in the schema cache")) {
    return "Database table 'car_images' is missing (or PostgREST schema cache is stale). Apply migration 007_car_images.sql then run NOTIFY pgrst, 'reload schema'.";
  }
  return message;
}

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const explicitBucket = process.env.SUPABASE_CAR_IMAGES_BUCKET || '';

  const { data: buckets, error: bucketsErr } = await client.storage.listBuckets();
  const bucketNames = (buckets || []).map((b: any) => String(b?.name || '')).filter(Boolean);
  const bucketSet = new Set(bucketNames);

  const resolvedBucket = explicitBucket
    ? explicitBucket
    : bucketSet.has(DEFAULT_BUCKET)
      ? DEFAULT_BUCKET
      : bucketSet.has(LEGACY_BUCKET)
        ? LEGACY_BUCKET
        : DEFAULT_BUCKET;

  const resolvedBucketInfo = (buckets || []).find((b: any) => b?.name === resolvedBucket) || null;
  const resolvedBucketPublic = typeof resolvedBucketInfo?.public === 'boolean' ? resolvedBucketInfo.public : null;

  const { error: tableErr } = await client.from('car_images').select('id').limit(1);

  return NextResponse.json({
    ok: true,
    data: {
      env: {
        NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        SUPABASE_CAR_IMAGES_BUCKET: explicitBucket || null,
      },
      storage: {
        bucketsListOk: !bucketsErr,
        bucketsListError: bucketsErr?.message || null,
        bucketNames,
        resolvedBucket,
        resolvedBucketExists: bucketSet.has(resolvedBucket),
        resolvedBucketPublic,
        note:
          resolvedBucketPublic === false
            ? 'Bucket is private; current implementation uses getPublicUrl(), so images will not load unless bucket is public.'
            : null,
      },
      db: {
        carImagesTableOk: !tableErr,
        carImagesTableError: tableErr ? normalizeSchemaCacheError(tableErr.message) : null,
      },
    },
  });
}

