import { jsonError, jsonOk } from '@/lib/apiResponse';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

const DEFAULT_BUCKET = 'car-images';
const LEGACY_BUCKET = 'car-image';

function normalizeSchemaCacheError(message: string) {
  if (message.includes("Could not find the table 'public.car_images' in the schema cache")) {
    return "Database table 'car_images' is missing (or PostgREST schema cache is stale). Apply migration 007_car_images.sql then run NOTIFY pgrst, 'reload schema'.";
  }
  return message;
}

export async function GET() {
  const client = getSupabaseAdminClient();
  if (!client) return jsonError('Server misconfigured', 500);

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

  return jsonOk({
    env: {
      VERCEL_ENV: process.env.VERCEL_ENV ?? 'local',
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      SUPABASE_CAR_IMAGES_BUCKET: explicitBucket || null,
    },
    storage: {
      bucketsListOk: !bucketsErr,
      bucketsListError: bucketsErr?.message || null,
      resolvedBucket,
      resolvedBucketExists: bucketSet.has(resolvedBucket),
      resolvedBucketPublic,
    },
    db: {
      carImagesTableOk: !tableErr,
      carImagesTableError: tableErr ? normalizeSchemaCacheError(tableErr.message) : null,
    },
  });
}

