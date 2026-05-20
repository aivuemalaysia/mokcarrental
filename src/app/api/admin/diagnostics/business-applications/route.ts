import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

function isSchemaCacheError(message: string) {
  return message.includes('schema cache');
}

function getSupabaseHost() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return raw;
  }
}

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const appSelect = await client.from('business_applications').select('id').limit(1);
  const imgSelect = await client.from('business_application_images').select('id').limit(1);

  let reloaded = false;
  let appAfter = appSelect;
  let imgAfter = imgSelect;

  const shouldRetry =
    (appSelect.error && isSchemaCacheError(appSelect.error.message || '')) ||
    (imgSelect.error && isSchemaCacheError(imgSelect.error.message || ''));

  if (shouldRetry) {
    const reload = await client.rpc('pgrst_reload_schema');
    if (!reload.error) {
      reloaded = true;
      appAfter = await client.from('business_applications').select('id').limit(1);
      imgAfter = await client.from('business_application_images').select('id').limit(1);
    }
  }

  return NextResponse.json({
    ok: true,
    data: {
      env: {
        supabaseHost: getSupabaseHost(),
        NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      },
      schema: {
        reloaded,
        businessApplicationsTableOk: !appAfter.error,
        businessApplicationsTableError: appAfter.error?.message || null,
        businessApplicationImagesTableOk: !imgAfter.error,
        businessApplicationImagesTableError: imgAfter.error?.message || null,
      },
    },
  });
}

