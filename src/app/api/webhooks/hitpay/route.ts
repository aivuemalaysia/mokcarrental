import { NextRequest, NextResponse } from 'next/server';
import { verifyHitpaySignature } from '@/lib/hitpay';
import { settleHitpayPayment } from '@/lib/hitpaySettle';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { writeAuditLog } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

// Event filter (item 5): only these HitPay events can drive settlement.
const HANDLEABLE = new Set([
  'charge.created',
  'charge.updated',
  'payment_request.completed',
  'payment_request.failed',
]);

function eventFromHeaders(req: NextRequest): { object: string; type: string; name: string } {
  const object = (req.headers.get('hitpay-event-object') || '').trim().toLowerCase();
  const type = (req.headers.get('hitpay-event-type') || '').trim().toLowerCase();
  // payment_request.* events arrive with object=payment_request, type=completed/failed.
  const name = object ? `${object}.${type}` : '';
  return { object, type, name };
}

function bookingIdFromRef(reference: string): string | null {
  // We carry booking id as `bk_<uuid>` in reference_number.
  if (typeof reference === 'string' && reference.startsWith('bk_')) {
    return reference.slice(3);
  }
  return null;
}

export async function POST(req: NextRequest) {
  const salt = process.env.HITPAY_WEBHOOK_SALT?.trim();
  if (!salt) {
    // No secret configured => refuse everything rather than accept unsigned.
    return NextResponse.json({ ok: false, error: 'webhook secret not configured' }, { status: 503 });
  }

  // Read the RAW body so the HMAC is computed over exactly what HitPay sent.
  const rawBody = await req.text();

  // Item 3 + 4: unauthenticated, HMAC-only, timing-safe.
  const headerSig = (req.headers.get('hitpay-signature') || '').trim();
  if (!headerSig || !verifyHitpaySignature(rawBody, headerSig, salt)) {
    await writeAuditLog({
      action: 'hitpay_webhook_bad_signature',
      resourceType: 'hitpay_webhook',
      details: { headerPresent: Boolean(headerSig) },
      request: req,
    });
    return NextResponse.json({ ok: false, error: 'invalid_signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ ok: false, error: 'empty_payload' }, { status: 400 });
  }

  // Item 5: event filter.
  const ev = eventFromHeaders(req);
  if (!HANDLEABLE.has(ev.name)) {
    // Acknowledge so HitPay stops retrying an event we do not care about.
    return NextResponse.json({ ok: true, error: null, ignored: ev.name }, { status: 200 });
  }

  // Item 6: gateway-attempt resolution. The payment-request id is what we
  // re-query; the booking + expected amount/reference come from our own records.
  const requestId: string | undefined =
    (payload as any).id || (payload as any).payment_request_id || (payload as any).order?.id;
  if (!requestId) {
    return NextResponse.json({ ok: false, error: 'missing_payment_request_id' }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'service role unavailable' }, { status: 503 });
  }

  // Find the booking + expected charge via the gateway_attempts recorded when
  // the payment request was created (our create-payment path stores reference
  // `bk_<bookingId>` plus amount/currency).
  const { data: attempts } = await admin
    .from('gateway_attempts')
    .select('id, booking_id, reference_number, amount, currency, status, env')
    .eq('hitpay_request_id', requestId)
    .limit(1);

  const attempt = (attempts || [])[0] as any;
  if (!attempt) {
    // Unknown attempt — do not settle. Leave for admin reconciliation.
    await writeAuditLog({
      action: 'hitpay_webhook_unknown_attempt',
      resourceType: 'hitpay_webhook',
      details: { requestId, event: ev.name },
      request: req,
    });
    return NextResponse.json({ ok: true, error: null, ignored: 'unknown_attempt' }, { status: 200 });
  }

  const bookingId = bookingIdFromRef(attempt.reference_number || '');
  if (!bookingId) {
    await writeAuditLog({
      action: 'hitpay_webhook_bad_reference',
      resourceType: 'hitpay_webhook',
      details: { requestId, reference: attempt.reference_number },
      request: req,
    });
    return NextResponse.json({ ok: false, error: 'unmapped_reference' }, { status: 400 });
  }

  // charge.created/updated carries the charge id; completed/failed map to it too.
  const chargeId: string | undefined = (payload as any).id;

  const result = await settleHitpayPayment({
    hitpayRequestId: requestId,
    bookingId,
    expectedAmount: Number(attempt.amount),
    expectedCurrency: attempt.currency,
    expectedReference: attempt.reference_number,
    chargeId,
  });

  await writeAuditLog({
    action: result.ok ? 'hitpay_webhook_settled' : 'hitpay_webhook_rejected',
    resourceType: 'hitpay_webhook',
    resourceId: bookingId,
    details: { event: ev.name, requestId, outcome: result.outcome, reason: 'reason' in result ? result.reason : undefined },
    request: req,
  });

  // Always 200 to a well-formed, well-signed event so HitPay does not retry
  // forever on a business-level rejection. Settlement state is recorded in DB.
  const body: any = { ok: result.ok, outcome: result.outcome };
  if (!result.ok) body.reason = (result as any).reason;
  return NextResponse.json(body, { status: 200 });
}

// Health probe so Deployment Protection / ops can confirm reachability.
export async function GET(req: NextRequest) {
  void req;
  return NextResponse.json({ ok: true, service: 'hitpay-webhook' }, { status: 200 });
}
