import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { getSupabaseUserFromRequest } from '@/lib/supabaseServerAuth';
import { rateLimit } from '@/lib/rateLimit';
import { writeAuditLog } from '@/lib/auditLog';
import { executionOperations } from '@/lib/execution/operations';

async function getRoleForUser(userId: string) {
  const client = getSupabaseAdminClient();
  if (!client) return { role: '', error: 'Server misconfigured' };

  const { data, error } = await client
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return { role: '', error: error.message };
  return { role: data?.role || 'user', error: '' };
}

function redactInput(input: any) {
  if (!input || typeof input !== 'object') return input;
  const clone: any = Array.isArray(input) ? [...input] : { ...input };
  for (const k of Object.keys(clone)) {
    if (k.toLowerCase().includes('token') || k.toLowerCase().includes('password') || k.toLowerCase().includes('key')) {
      clone[k] = '[redacted]';
    }
  }
  return clone;
}

export async function handleExecutionRequest(request: Request) {
  const startedAt = Date.now();
  const { user, error: authError } = await getSupabaseUserFromRequest(request);
  if (authError) return { status: 401, body: { ok: false, error: authError } };

  const rateKey = `exec:${user.id}`;
  const limited = rateLimit({ key: rateKey, limit: 30, windowMs: 60_000 });
  if (!limited.ok) {
    await writeAuditLog({
      action: 'rate_limit',
      resourceType: 'execution',
      resourceId: 'rate_limit',
      details: { resetAt: limited.resetAt },
      request,
      userEmail: user.email || undefined,
    });
    return { status: 429, body: { ok: false, error: 'Rate limit exceeded' } };
  }

  const body = await request.json().catch(() => null);
  const opName = typeof body?.op === 'string' ? body.op : '';
  const input = body?.input;

  if (!opName) return { status: 400, body: { ok: false, error: 'Missing op' } };
  const op = executionOperations[opName];
  if (!op) return { status: 400, body: { ok: false, error: 'Unknown op' } };

  const { role, error: roleError } = await getRoleForUser(user.id);
  if (roleError) return { status: 500, body: { ok: false, error: roleError } };

  if (!op.allowedRoles.includes(role)) {
    await writeAuditLog({
      action: 'forbidden',
      resourceType: 'execution',
      resourceId: opName,
      details: { role },
      request,
      userEmail: user.email || undefined,
    });
    return { status: 403, body: { ok: false, error: 'Forbidden' } };
  }

  const validated = op.validate(input);
  if (!validated.ok) {
    await writeAuditLog({
      action: 'validation_error',
      resourceType: 'execution',
      resourceId: opName,
      details: { error: validated.error },
      request,
      userEmail: user.email || undefined,
    });
    return { status: 400, body: { ok: false, error: validated.error } };
  }

  try {
    const result = await op.execute(
      {
        userId: user.id,
        userEmail: user.email || '',
        role,
        request,
      },
      validated.value,
    );

    await writeAuditLog({
      action: 'execute',
      resourceType: 'execution',
      resourceId: opName,
      details: { ok: true, durationMs: Date.now() - startedAt, input: redactInput(validated.value) },
      request,
      userEmail: user.email || undefined,
    });

    return { status: 200, body: { ok: true, data: result.data } };
  } catch (e: any) {
    const message = typeof e?.message === 'string' ? e.message : 'Execution failed';

    await writeAuditLog({
      action: 'execute',
      resourceType: 'execution',
      resourceId: opName,
      details: { ok: false, durationMs: Date.now() - startedAt, error: message, input: redactInput(validated.value) },
      request,
      userEmail: user.email || undefined,
    });

    return { status: 500, body: { ok: false, error: message } };
  }
}

