import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

function isSchemaCacheError(message: string) {
  return message.includes('schema cache');
}

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const baseSelect = await client.from('cars').select('id').limit(1);
  const before = await client.from('cars').select('id,status').limit(1);

  if (before.error) {
    console.error('IK: diagnostics cars-status error (before reload)', before.error, before.error.stack);
  }

  let after: typeof before | null = null;
  if (before.error && isSchemaCacheError(before.error.message || '')) {
    const reload = await client.rpc('pgrst_reload_schema');
    if (reload.error) {
      console.error('IK: diagnostics cars-status reload error', reload.error, reload.error.stack);
    } else {
      after = await client.from('cars').select('id,status').limit(1);
      if (after.error) {
        console.error('IK: diagnostics cars-status error (after reload)', after.error, after.error.stack);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    data: {
      env: {
        NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      },
      db: {
        carsTableOk: !baseSelect.error,
        carsTableError: baseSelect.error?.message || null,
        statusColumnOk: !before.error,
        statusColumnError: before.error?.message || null,
        statusColumnRetried: Boolean(after),
        statusColumnOkAfterReload: after ? !after.error : null,
        statusColumnErrorAfterReload: after?.error?.message || null,
      },
    },
  });
}
