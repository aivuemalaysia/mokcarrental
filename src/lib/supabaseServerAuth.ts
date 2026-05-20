import { createClient } from '@supabase/supabase-js';

export function getSupabaseAnonServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function getBearerTokenFromRequest(request: Request) {
  const raw = request.headers.get('authorization') || '';
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || '';
}

export async function getSupabaseUserFromRequest(request: Request) {
  const client = getSupabaseAnonServerClient();
  if (!client) return { user: null as any, error: 'Server misconfigured' };

  const token = getBearerTokenFromRequest(request);
  if (!token) return { user: null as any, error: 'Missing bearer token' };

  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return { user: null as any, error: 'Invalid token' };

  return { user: data.user, error: '' };
}

