import 'server-only';
import { createClient } from '@supabase/supabase-js';


export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    if (typeof window !== 'undefined') {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing - do not call getSupabaseAdminClient() from the browser');
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Server misconfigured: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
    }
    // Non-production: return null gracefully for dev/test
    return null;
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

