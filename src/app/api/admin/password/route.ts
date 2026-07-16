import { jsonError, jsonOk } from '@/lib/apiResponse';
import { requireAdminSession } from '@/lib/adminApi';
import { isValidAdminCredentials } from '@/lib/adminAuth';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';
import { validateCsrfToken } from "@/lib/csrf";

function bytesToBase64(bytes: Uint8Array) {
  const anyGlobal = globalThis as any;
  if (typeof anyGlobal?.btoa === 'function') {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return anyGlobal.btoa(binary);
  }
  return Buffer.from(bytes).toString('base64');
}

function bytesToBase64Url(bytes: Uint8Array) {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function pbkdf2Sha256(password: string, salt: Uint8Array, iterations: number) {
  const saltForCrypto = new Uint8Array(salt).slice().buffer as ArrayBuffer;
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltForCrypto,
      iterations,
    },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
}

function isStrongPassword(password: string) {
  return (
    password.length >= 6 &&
    password.length <= 128 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  );
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (!session.ok) return jsonError('Unauthorized', 401);

  const body = await request.json().catch(() => null);
  // CSRF protection
  const cookieStore = cookies();
  const csrfValid = await validateCsrfToken(request, cookieStore);
  if (!csrfValid) {
    return jsonError('Invalid CSRF token', 403);
  }
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';
  const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : '';

  if (!currentPassword || !newPassword || !confirmPassword) return jsonError('Invalid input', 400);
  if (newPassword !== confirmPassword) return jsonError('Passwords do not match', 400);
  if (!isStrongPassword(newPassword)) return jsonError('Password too weak', 400);

  const currentOk = await isValidAdminCredentials(session.email, currentPassword);
  if (!currentOk) return jsonError('Invalid current password', 401);

  const client = getSupabaseAdminClient();
  if (!client) return jsonError('Server misconfigured', 500);

  const iterations = 210000;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await pbkdf2Sha256(newPassword, salt, iterations);

  const password_salt = bytesToBase64Url(salt);
  const password_hash = bytesToBase64Url(derived);

  const { error } = await client.from('admin_auth').upsert(
    {
      id: 'singleton',
      email: session.email,
      password_hash,
      password_salt,
      password_iterations: iterations,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) {
    const message = error.message || 'Unknown error';
    if (message.includes('relation') && message.includes('admin_auth')) {
      return jsonError('Database not migrated: missing table admin_auth', 500);
    }
    return jsonError(message, 500);
  }

  console.warn('IK:ADMIN_PASSWORD_UPDATED', JSON.stringify({ email: session.email }));
  return jsonOk({ updated: true });
}
