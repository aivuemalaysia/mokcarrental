import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

export async function writeAuditLog({
  action,
  resourceType,
  resourceId,
  details,
  request,
  userEmail,
}: {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  request?: Request;
  userEmail?: string;
}) {
  const client = getSupabaseAdminClient();
  if (!client) return;

  const ip =
    request?.headers.get('x-forwarded-for') ||
    request?.headers.get('x-real-ip') ||
    request?.headers.get('cf-connecting-ip') ||
    null;

  const user_agent = request?.headers.get('user-agent') || null;

  await client.from('audit_logs').insert([
    {
      user_email: userEmail || null,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      details: details || null,
      ip_address: ip,
      user_agent,
    },
  ]);
}

