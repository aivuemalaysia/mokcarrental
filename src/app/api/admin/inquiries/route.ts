import { jsonError, jsonOk } from '@/lib/apiResponse';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return jsonError('Unauthorized', 401);

  const client = getSupabaseAdminClient();
  if (!client) return jsonError('Server misconfigured', 500);

  const url = new URL(request.url);
  const limitRaw = url.searchParams.get('limit') || '';
  const statusRaw = url.searchParams.get('status') || '';

  let query = (client.from('inquiries') as any).select('*');

  if (statusRaw === 'pending' || statusRaw === 'confirmed' || statusRaw === 'cancelled') {
    query = query.eq('status', statusRaw);
  }

  query = query.order('created_at', { ascending: false });

  const limit = Number(limitRaw);
  if (Number.isFinite(limit) && limit > 0) {
    query = query.limit(Math.min(limit, 200));
  }

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);

  return jsonOk(data);
}
