import { jsonError, jsonOk } from '@/lib/apiResponse';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return jsonError('Unauthorized', 401);

  const client = getSupabaseAdminClient();
  if (!client) return jsonError('Server misconfigured', 500);

  const { data, error } = await (client.from('contacts') as any)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    if (error.message?.includes('schema cache') || error.message?.includes("Could not find the table")) {
      return jsonOk({ data: [], tableMissing: true, tableError: error.message });
    }
    return jsonError(error.message, 500);
  }

  return jsonOk({ data });
}
