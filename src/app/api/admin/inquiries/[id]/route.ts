import { jsonError, jsonOk } from '@/lib/apiResponse';
import { requireAdminSession } from '@/lib/adminApi';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { validateInquiryStatus } from '@/lib/validation/inquiry';

export async function PUT(request: Request, ctx: { params: { id: string } }) {
  const session = await requireAdminSession(request);
  if (!session.ok) return jsonError('Unauthorized', 401);

  const client = getSupabaseAdminClient();
  if (!client) return jsonError('Server misconfigured', 500);

  const body = await request.json()
  // CSRF protection
  const cookieStore = cookies();
  const csrfValid = await validateCsrfToken(request, cookieStore);
  if (!csrfValid) {
    return jsonError('Invalid CSRF token', 403);
  }
.catch(() => null);
  const validated = validateInquiryStatus(body);
  if (!validated.ok) return jsonError(validated.error, 400);

  const { data, error } = await (client.from('inquiries') as any)
    .update({ status: validated.value })
    .eq('id', ctx.params.id)
    .select('*')
    .single();
  if (error) return jsonError(error.message, 500);

  const event = await (client.from('inquiries_events') as any)
    .insert([{ event_type: 'inquiry_updated', inquiry_id: ctx.params.id }])
    .select('id')
    .single();
  if (event.error) {
    console.error('IK: inquiries_events insert failed', event.error);
  }

  return jsonOk(data);
}
