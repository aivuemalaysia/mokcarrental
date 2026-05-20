import { jsonError, jsonOk } from '@/lib/apiResponse';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

function isMissingTableError(message: string) {
  return message.includes('schema cache') || message.includes("Could not find the table 'public.");
}

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return jsonError('Unauthorized', 401);

  const client = getSupabaseAdminClient();
  if (!client) return jsonError('Server misconfigured', 500);

  const totalRes = await client.from('inquiries').select('id', { count: 'exact', head: true });
  if (totalRes.error) return jsonError(totalRes.error.message || 'Failed to query inquiries', 500);

  const pendingRes = await client.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'pending');
  const confirmedRes = await client.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'confirmed');
  const cancelledRes = await client.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'cancelled');

  if (pendingRes.error) return jsonError(pendingRes.error.message || 'Failed to query pending inquiries', 500);
  if (confirmedRes.error) return jsonError(confirmedRes.error.message || 'Failed to query confirmed inquiries', 500);
  if (cancelledRes.error) return jsonError(cancelledRes.error.message || 'Failed to query cancelled inquiries', 500);

  const latestRes = await client
    .from('inquiries')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestCreatedAt = typeof (latestRes.data as any)?.created_at === 'string' ? (latestRes.data as any).created_at : null;

  let eventsTableOk = true;
  let eventsTableWarning: string | null = null;
  const eventsCheck = await client.from('inquiries_events').select('id').limit(1);
  if (eventsCheck.error) {
    eventsTableOk = false;
    eventsTableWarning = isMissingTableError(eventsCheck.error.message || '') ? eventsCheck.error.message : 'inquiries_events check failed';
  }

  return jsonOk({
    total: typeof totalRes.count === 'number' ? totalRes.count : 0,
    pending: typeof pendingRes.count === 'number' ? pendingRes.count : 0,
    confirmed: typeof confirmedRes.count === 'number' ? confirmedRes.count : 0,
    cancelled: typeof cancelledRes.count === 'number' ? cancelledRes.count : 0,
    latestCreatedAt,
    eventsTableOk,
    eventsTableWarning,
  });
}

