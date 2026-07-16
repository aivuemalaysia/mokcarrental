import { getSupabaseAdminClient } from './supabaseAdmin';

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

setInterval(cleanupOldEntries, CLEANUP_INTERVAL_MS);

async function checkSupabaseRateLimit(key: string, limit: number, windowMs: number): Promise<{ ok: boolean; remaining: number; resetAt: number }> {
  const client = getSupabaseAdminClient();
  if (!client) return { ok: true, remaining: limit, resetAt: Date.now() + windowMs };

  const now = new Date().toISOString();
  const windowStart = new Date(Date.now() - windowMs).toISOString();

  const { count, error } = await client
    .from('rate_limit_tracker')
    .select('*', { count: 'exact', head: true })
    .eq('key', key)
    .gte('created_at', windowStart);

  if (error) {
    console.warn('IK:RATE_LIMIT_DB_ERROR', error.message);
    return { ok: true, remaining: limit, resetAt: Date.now() + windowMs };
  }

  const currentCount = count || 0;
  if (currentCount >= limit) {
    return { ok: false, remaining: 0, resetAt: Date.now() + windowMs };
  }

  await client.from('rate_limit_tracker').insert({
    key,
    count: 1,
    created_at: now,
  });

  return { ok: true, remaining: Math.max(0, limit - currentCount - 1), resetAt: Date.now() + windowMs };
}

export async function rateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ ok: boolean; remaining: number; resetAt: number }> {
  // Try database-backed rate limiting first
  try {
    const result = await checkSupabaseRateLimit(key, limit, windowMs);
    if (result.ok || !result.ok) return result;
  } catch {
    // Fall back to in-memory if DB fails
  }

  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs };
    buckets.set(key, next);
    return { ok: true, remaining: limit - 1, resetAt: next.resetAt };
  }

  if (existing.count >= limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { ok: true, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}
