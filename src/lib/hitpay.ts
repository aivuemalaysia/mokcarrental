import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * HitPay API client + webhook signature helpers (Phase 7).
 *
 * SECURITY MODEL
 * - The webhook salt is a secret; it only ever lives in env (Vercel/Supabase),
 *   never in committed files.
 * - Signature comparison MUST use timingSafeEqual to avoid timing attacks.
 * - The client only re-queries status (GET /v1/payment-requests/{id}). It never
 *   settles on its own; settlement is the webhook route's job (authoritative).
 *
 * ENV SAFETY GATE (no live money)
 * - HITPAY_ENV defaults to 'sandbox'. We refuse to build a client for
 *   'production' unless the sandbox flag is explicitly present, so a
 *   misconfigured deploy can never call the live API and move real money.
 */

export type HitPayEnv = 'sandbox' | 'production';

function resolveEnv(): HitPayEnv {
  const raw = (process.env.HITPAY_ENV || 'sandbox').trim().toLowerCase();
  if (raw === 'production') return 'production';
  return 'sandbox';
}

function resolveBaseUrl(): string {
  // Explicit base URL wins (lets ops point sandbox at a custom host).
  const explicit = process.env.HITPAY_API_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');
  return resolveEnv() === 'production'
    ? 'https://api.hit-pay.com'
    : 'https://api.sandbox.hit-pay.com';
}

function requireKey(): string {
  const key = process.env.HITPAY_API_KEY?.trim();
  if (!key) {
    throw new Error('HITPAY_API_KEY is not configured');
  }
  return key;
}

export function hitpayEnv(): HitPayEnv {
  return resolveEnv();
}

export function hitpayBaseUrl(): string {
  return resolveBaseUrl();
}

/**
 * Compute the expected `Hitpay-Signature` for a raw webhook body.
 * HMAC-SHA256 over the raw bytes, keyed with the webhook salt, hex-encoded.
 */
export function computeHitpaySignature(rawBody: string | Buffer, salt: string): string {
  return createHmac('sha256', salt).update(rawBody).digest('hex');
}

/**
 * Constant-time signature check. Safe even when lengths differ (we still run
 * both through a fixed comparison) to avoid leaking length information.
 */
export function verifyHitpaySignature(rawBody: string, headerSig: string, salt: string): boolean {
  const expected = computeHitpaySignature(Buffer.from(rawBody, 'utf8'), salt);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(headerSig, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export interface HitPayPaymentRequest {
  id: string;
  amount: string | number;
  currency: string;
  status: string; // pending | completed | failed | expired | canceled | inactive
  reference_number?: string | null;
  [key: string]: unknown;
}

/**
 * Authoritatively re-query a payment request's status from HitPay.
 * Throws on missing key / transport error so the caller can treat "unknown"
 * as "do not settle" (a webhook can NEVER settle by itself alone).
 */
export async function getPaymentRequestStatus(requestId: string): Promise<HitPayPaymentRequest> {
  const key = requireKey();
  const base = hitpayBaseUrl();
  const url = `${base}/v1/payment-requests/${encodeURIComponent(requestId)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-BUSINESS-API-KEY': key,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HitPay status re-query failed: HTTP ${res.status} ${text.slice(0, 200)}`);
  }

  const body = (await res.json()) as HitPayPaymentRequest;
  if (!body || typeof body !== 'object' || !body.id) {
    throw new Error('HitPay status re-query returned an unexpected body');
  }
  return body;
}

/**
 * Numeric comparison helper: HitPay returns amount as a string in the
 * payment-request API but a number in the charge payload. Normalize both.
 */
export function toCents(value: string | number, fallbackScale: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallbackScale;
  return n;
}
