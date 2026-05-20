import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminApi';
import { DEFAULT_MIN_IMAGES_PER_CAR } from '@/lib/carImageConstraints';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

function normalizeSchemaCacheError(message: string) {
  if (message.includes("Could not find the table 'public.car_images' in the schema cache")) {
    return "Database table 'car_images' is missing (or PostgREST schema cache is stale). Apply migration 007_car_images.sql then run NOTIFY pgrst, 'reload schema'.";
  }
  return message;
}

export async function POST(request: Request, ctx: { params: { id: string } }) {
  const session = await requireAdminSession(request);
  if (!session.ok) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  const { count, error } = await client
    .from('car_images')
    .select('id', { count: 'exact', head: true })
    .eq('car_id', ctx.params.id);

  if (error) return NextResponse.json({ ok: false, error: normalizeSchemaCacheError(error.message) }, { status: 500 });

  const imageCount = typeof count === 'number' ? count : 0;
  if (imageCount < DEFAULT_MIN_IMAGES_PER_CAR) {
    return NextResponse.json(
      { ok: false, error: `Please upload at least ${DEFAULT_MIN_IMAGES_PER_CAR} images before finishing.` },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, data: { imageCount } });
}
