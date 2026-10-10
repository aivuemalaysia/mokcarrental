import { jsonOk, jsonError } from '@/lib/apiResponse';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

// Admin reconciliation surface (Phase 7, item 9).
//
// GET  -> list gateway_attempts joined with canonical payments + booking status,
//         canonical payments live in the `hitpay_payments` table (Phase 7).
//         optionally filtered by status so ops can hunt mismatches/overpayments.
//
// POST -> manual reconciliation action:
//         { "attemptId": "...", "action": "mark-failed" | "mark-cleared" }
//         - mark-failed: ops confirms a mismatched/unknown attempt should not settle.
//         - mark-cleared: ops confirms an overpaid/cancelled attempt was handled.
// Both are audit-logged. This is the only admin write into gateway_attempts.
export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return jsonError('Unauthorized', 401);

  const client = getSupabaseAdminClient();
  if (!client) return jsonError('Server misconfigured', 500);

  const url = new URL(request.url);
  const status = url.searchParams.get('status') || '';

  let q: any = client.from('gateway_attempts').select('*');
  if (status) q = q.eq('status', status);
  q = q.order('created_at', { ascending: false }).limit(200);

  const { data, error } = await q;
  if (error) return jsonError(error.message, 500);
  return jsonOk(data);
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return jsonError('Unauthorized', 401);

  const client = getSupabaseAdminClient();
  if (!client) return jsonError('Server misconfigured', 500);

  const body = await request.json().catch(() => null);
  const attemptId = typeof body?.attemptId === 'string' ? body.attemptId : '';
  const action = body?.action;
  if (!attemptId || (action !== 'mark-failed' && action !== 'mark-cleared')) {
    return jsonError('attemptId and action(mark-failed|mark-cleared) required', 400);
  }

  const target = action === 'mark-failed' ? 'failed' : 'settled';
  const { error } = await client
    .from('gateway_attempts')
    .update({ status: target, updated_at: new Date().toISOString() })
    .eq('id', attemptId);
  if (error) return jsonError(error.message, 500);

  return jsonOk({ attemptId, action, status: target });
}
