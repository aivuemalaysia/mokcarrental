import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'server-only';

/**
 * Server-side Supabase client that uses the service_role key.
 *
 * The RLS lockdown (supabase-security-fix.sql) removed the permissive
 * anon read policies on `cars` and `car_images`, so the public-facing
 * anon key can no longer read the fleet. These server-side queries are
 * read-only GETs, so running them with service_role (bypasses RLS) is
 * the intended app design — the site's content API does exactly this.
 *
 * SECURITY: Never import this module from a client component.
 * The `server-only` import makes bundling into the browser fail at build time.
 */

function buildClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !serviceKey) {
    throw new Error(
      'supabaseServer: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.'
    );
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// Lazy so module import doesn't throw before env is available (e.g. in lint).
let _client: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (!_client) _client = buildClient();
  return _client;
}
