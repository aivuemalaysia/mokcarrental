import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import 'server-only';

export const ADMIN_EMAIL = 'admin@mokcarrental.com';
// DEPRECATED: Production must use ADMIN_PASSWORD_HASH + ADMIN_PASSWORD_SALT env vars.
// The plain password fallback is for local development only and will be removed.
// SECURITY FIX: Hardcoded password removed. Admin must configure PBKDF2 hash env vars.
export const ADMIN_PASSWORD = '';
export const ADMIN_TOKEN_COOKIE = 'admin_token';

export type AdminAuthMode = 'pbkdf2' | 'plain' | 'missing';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getAdminEmail() {
  const envEmail = process.env.ADMIN_EMAIL;
  return normalizeEmail(typeof envEmail === 'string' && envEmail ? envEmail : ADMIN_EMAIL);
}

function getAdminPassword() {
  // DEPRECATED: Production must use ADMIN_PASSWORD_HASH + ADMIN_PASSWORD_SALT
  const envPassword = process.env.ADMIN_PASSWORD || '';
  if (envPassword) return envPassword;
  // SECURITY FIX: No fallback - admin must configure PBKDF2 hash or env password
  return '';
}

function base64UrlToBytes(b64url: string) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (b64.length % 4)) % 4;
  const padded = b64 + '='.repeat(padLen);
  const anyGlobal = globalThis as any;
  if (typeof anyGlobal?.atob === 'function') {
    const binary = anyGlobal.atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  return new Uint8Array(Buffer.from(padded, 'base64'));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
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

type AdminAuthRow = {
  password_hash: string | null;
  password_salt: string | null;
  password_iterations: number | null;
};

async function getDbPasswordConfig(): Promise<AdminAuthRow | null> {
  const client = getSupabaseAdminClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from('admin_auth')
      .select('password_hash,password_salt,password_iterations')
      .eq('id', 'singleton')
      .maybeSingle();
    if (error) {
      console.warn('IK:ADMIN_AUTH_DB_READ_ERROR', JSON.stringify({ message: error.message }));
      return null;
    }
    if (!data) return null;
    return data as AdminAuthRow;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.warn('IK:ADMIN_AUTH_DB_READ_THROW', JSON.stringify({ message }));
    return null;
  }
}

async function verifyPassword(password: string) {
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  const envSalt = process.env.ADMIN_PASSWORD_SALT;
  const envIterations = process.env.ADMIN_PASSWORD_ITERATIONS;

  if (typeof envHash === 'string' && envHash) {
    if (typeof envSalt !== 'string' || !envSalt) return false;
    const iterations = Number(envIterations || '210000');
    if (!Number.isFinite(iterations) || iterations < 10000) return false;

    const saltBytes = base64UrlToBytes(envSalt);
    const expected = base64UrlToBytes(envHash);
    const actual = await pbkdf2Sha256(password, saltBytes, iterations);
    return constantTimeEqual(actual, expected);
  }

  const dbConfig = await getDbPasswordConfig();
  if (dbConfig?.password_hash && dbConfig?.password_salt) {
    const iterations = Number(dbConfig.password_iterations || 210000);
    if (!Number.isFinite(iterations) || iterations < 10000) return false;
    const saltBytes = base64UrlToBytes(dbConfig.password_salt);
    const expected = base64UrlToBytes(dbConfig.password_hash);
    const actual = await pbkdf2Sha256(password, saltBytes, iterations);
    return constantTimeEqual(actual, expected);
  }

  const fallbackPassword = getAdminPassword();
  if (fallbackPassword && password === fallbackPassword) return true;
  // SECURITY FIX: No hardcoded fallback; PBKDF2 auth must succeed or login fails
  return false;
}

export function getAdminAuthDebugInfo() {
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  const envSalt = process.env.ADMIN_PASSWORD_SALT;
  const envIterations = process.env.ADMIN_PASSWORD_ITERATIONS;

  const hasHash = typeof envHash === 'string' && envHash.length > 0;
  const hasSalt = typeof envSalt === 'string' && envSalt.length > 0;
  const hasPassword = Boolean(getAdminPassword());
  const iterations = Number(envIterations || '210000');

  const mode: AdminAuthMode = hasHash && hasSalt ? 'pbkdf2' : hasPassword ? 'plain' : 'missing';

  return {
    mode,
    nodeEnv: process.env.NODE_ENV,
    hasPassword,
    hasHash,
    hasSalt,
    iterations: Number.isFinite(iterations) ? iterations : null,
  };
}

export async function isValidAdminCredentials(email: string, password: string) {
  if (normalizeEmail(email) !== getAdminEmail()) return false;
  return verifyPassword(password);
}
