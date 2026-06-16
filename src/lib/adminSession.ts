type SessionPayload = {
  email: string;
  iat: number;
  exp: number;
};

function getSecret(required: boolean) {
  const secret = process.env.ADMIN_SESSION_SECRET || '';
  if (!secret) {
    // In production, throw a clear error
    if (required) {
      throw new Error(
        'Server misconfigured: ADMIN_SESSION_SECRET environment variable must be set. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }
    // In non-production, allow unsigned dev tokens
    return '';
  }
  return secret;
}

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

function base64ToBytes(b64: string) {
  const anyGlobal = globalThis as any;
  if (typeof anyGlobal?.atob === 'function') {
    const binary = anyGlobal.atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

function bytesToBase64Url(bytes: Uint8Array) {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(b64url: string) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (b64.length % 4)) % 4;
  const padded = b64 + '='.repeat(padLen);
  return base64ToBytes(padded);
}

async function getHmacKey(secret: string) {
  const bytes = new TextEncoder().encode(secret);
  return crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createAdminSessionToken(email: string) {
  const secret = getSecret(process.env.NODE_ENV === 'production');
  if (!secret) {
    return `admin-token-${crypto.randomUUID()}`;
  }
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { email, iat: now, exp: now + 60 * 60 * 24 * 7 };
  const encoded = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getHmacKey(secret);
  const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encoded));
  const sig = bytesToBase64Url(new Uint8Array(sigBuf));
  return `${encoded}.${sig}`;
}

export async function verifyAdminSessionToken(token: string) {
  if (process.env.NODE_ENV !== 'production' && token.startsWith('admin-token-')) {
    return { ok: true as const, email: 'admin@mokcarrental.com' };
  }
  const secret = getSecret(false);
  if (!secret) {
    return { ok: false as const };
  }
  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false as const };
  const [encoded, sig] = parts;
  const key = await getHmacKey(secret);
  const ok = await crypto.subtle.verify('HMAC', key, base64UrlToBytes(sig), new TextEncoder().encode(encoded));
  if (!ok) return { ok: false as const };
  const raw = new TextDecoder().decode(base64UrlToBytes(encoded));
  const payload = JSON.parse(raw) as SessionPayload;
  const now = Math.floor(Date.now() / 1000);
  if (!payload?.email || typeof payload.email !== 'string') return { ok: false as const };
  if (!payload?.exp || typeof payload.exp !== 'number') return { ok: false as const };
  if (payload.exp <= now) return { ok: false as const };
  return { ok: true as const, email: payload.email };
}
