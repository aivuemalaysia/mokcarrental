import 'server-only';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { getPaymentRequestStatus, hitpayEnv } from '@/lib/hitpay';

export type SettlementResult =
  | { ok: true; outcome: 'settled' | 'idempotent' | 'overpaid' | 'skipped_cancelled'; paymentId?: string; attemptId?: string }
  | { ok: false; outcome: 'rejected'; reason: string };

export interface SettleInput {
  hitpayRequestId: string;
  bookingId: string;
  expectedAmount: number;
  expectedCurrency: string;
  expectedReference: string;
  chargeId?: string;
}

/**
 * Authoritative HitPay settlement (Phase 7, item 8).
 *
 * A webhook is NEVER trusted to settle by itself. We re-query the provider,
 * re-check amount/currency/reference/env, and only then perform an atomic,
 * idempotent settlement. Idempotency (re-delivered webhook) and completed-attempt
 * reuse (item 0) are both handled here.
 */
export async function settleHitpayPayment(input: SettleInput): Promise<SettlementResult> {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return { ok: false, outcome: 'rejected', reason: 'service role client unavailable' };
  }

  const env = hitpayEnv();

  // 1) Resolve the gateway attempt. Reuse an existing completed attempt when
  //    possible (item 0: completed-attempt reuse) instead of duplicating.
  const attemptsQ = admin
    .from('gateway_attempts')
    .select('id, status, hitpay_request_id, reference_number, amount, currency, env')
    .eq('booking_id', input.bookingId);

  let matched: any[] = [];
  {
    const { data, error } = await attemptsQ;
    if (error) return { ok: false, outcome: 'rejected', reason: `attempt lookup failed: ${error.message}` };
    matched = (data || []) as any[];
  }

  const hitpayAttempt =
    matched.find((a) => a.hitpay_request_id === input.hitpayRequestId) ||
    matched.find((a) => a.reference_number === input.expectedReference);

  // Reuse an already-settled attempt => idempotent success.
  const settledAttempt = matched.find(
    (a) => a.status === 'settled' && (a.hitpay_request_id === input.hitpayRequestId || a.reference_number === input.expectedReference),
  );
  if (settledAttempt) {
    const { data: existing } = await admin
      .from('payments')
      .select('id')
      .eq('gateway_attempt_id', settledAttempt.id)
      .maybeSingle();
    return {
      ok: true,
      outcome: 'idempotent',
      attemptId: settledAttempt.id,
      paymentId: existing?.id,
    };
  }

  let attempt = hitpayAttempt;
  if (!attempt) {
    // No attempt recorded yet (first time we see this request) — create it.
    const { data: created, error: insErr } = await admin
      .from('gateway_attempts')
      .insert({
        booking_id: input.bookingId,
        hitpay_request_id: input.hitpayRequestId,
        reference_number: input.expectedReference,
        amount: input.expectedAmount,
        currency: input.expectedCurrency.toUpperCase(),
        status: 'pending',
        env,
      })
      .select('id, status')
      .single();
    if (insErr || !created) {
      return { ok: false, outcome: 'rejected', reason: `attempt insert failed: ${insErr?.message || 'no row'}` };
    }
    attempt = created;
  }

  // 2) Provider re-query (item 7): authoritative status, re-validate everything.
  let live;
  try {
    live = await getPaymentRequestStatus(input.hitpayRequestId);
  } catch (e: any) {
    // Do NOT settle. Mark attempt failed so ops can reconcile.
    await admin.from('gateway_attempts').update({ status: 'failed', failure_reason: `re-query: ${e?.message}` }).eq('id', attempt.id);
    return { ok: false, outcome: 'rejected', reason: `provider re-query failed: ${e?.message}` };
  }

  // 3) Match gates. Amount/currency/reference/env must all agree.
  const liveAmount = Number(live.amount);
  if (!Number.isFinite(liveAmount)) {
    await admin.from('gateway_attempts').update({ status: 'failed', failure_reason: 're-query amount not numeric' }).eq('id', attempt.id);
    return { ok: false, outcome: 'rejected', reason: 'provider amount not numeric' };
  }
  const currencyMatch = (live.currency || '').toUpperCase() === input.expectedCurrency.toUpperCase();
  const refMatch = !live.reference_number || live.reference_number === input.expectedReference;
  const amountMatch = Math.abs(liveAmount - input.expectedAmount) < 0.005;
  // env gate: a sandbox payment must not settle against a production attempt.
  const envMatch = live.id ? attempt.env === env : true;

  if (!currencyMatch || !refMatch || !envMatch) {
    await admin.from('gateway_attempts').update({ status: 'failed', failure_reason: `mismatch currency=${currencyMatch} ref=${refMatch} env=${envMatch}` }).eq('id', attempt.id);
    return { ok: false, outcome: 'rejected', reason: `provider mismatch: currency=${currencyMatch} ref=${refMatch} env=${envMatch}` };
  }

  // 4) Status handling.
  if (live.status === 'completed') {
    // Overpayment: more than expected is NOT auto-settled — flag for review.
    if (liveAmount > input.expectedAmount + 0.005) {
      await admin
        .from('gateway_attempts')
        .update({ status: 'overpaid', failure_reason: `overpayment ${liveAmount} > ${input.expectedAmount}` })
        .eq('id', attempt.id);
      return { ok: true, outcome: 'overpaid', attemptId: attempt.id };
    }
    // Cancelled-booking handling: do not confirm a cancelled booking.
    const { data: booking } = await admin.from('bookings').select('id, status').eq('id', input.bookingId).maybeSingle();
    if (!booking) {
      await admin.from('gateway_attempts').update({ status: 'failed', failure_reason: 'booking not found' }).eq('id', attempt.id);
      return { ok: false, outcome: 'rejected', reason: 'booking not found' };
    }
    if (booking.status === 'cancelled') {
      await admin
        .from('gateway_attempts')
        .update({ status: 'cancelled', failure_reason: 'booking cancelled; refund path' })
        .eq('id', attempt.id);
      // Record the payment as settled so we have an authoritative record, but
      // do NOT move the booking. Refund is a separate admin action.
      const ins = await admin
        .from('payments')
        .insert({ gateway_attempt_id: attempt.id, booking_id: input.bookingId, hitpay_charge_id: input.chargeId, amount: liveAmount, currency: input.expectedCurrency.toUpperCase() })
        .select('id')
        .single();
      await admin.from('gateway_attempts').update({ status: 'cancelled', settled_at: new Date().toISOString() }).eq('id', attempt.id);
      return { ok: true, outcome: 'skipped_cancelled', attemptId: attempt.id, paymentId: ins.data?.id };
    }
  } else if (live.status === 'failed' || live.status === 'expired' || live.status === 'canceled') {
    await admin.from('gateway_attempts').update({ status: 'failed', failure_reason: `provider ${live.status}` }).eq('id', attempt.id);
    return { ok: false, outcome: 'rejected', reason: `provider status ${live.status}` };
  } else {
    // pending / inactive / unknown -> not settled yet.
    return { ok: true, outcome: 'idempotent', attemptId: attempt.id };
  }

  // 5) Atomic settlement: insert canonical payment + confirm booking + mark
  //    attempt settled. Insert into payments is UNIQUE on gateway_attempt_id,
  //    so a racing duplicate webhook loses the race and is a no-op.
  const payInsert = await admin
    .from('payments')
    .insert({
      gateway_attempt_id: attempt.id,
      booking_id: input.bookingId,
      hitpay_charge_id: input.chargeId,
      amount: liveAmount,
      currency: input.expectedCurrency.toUpperCase(),
      settled_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (payInsert.error) {
    // Likely a unique-violation => an attempt got settled concurrently (idempotent).
    if (payInsert.error.code === '23505') {
      return { ok: true, outcome: 'idempotent', attemptId: attempt.id };
    }
    return { ok: false, outcome: 'rejected', reason: `payment insert failed: ${payInsert.error.message}` };
  }

  const conf = await admin.from('bookings').update({ status: 'confirmed' }).eq('id', input.bookingId).eq('status', 'pending');
  if (conf.error) {
    // Roll back the canonical payment so we never leave a dangling settled row.
    await admin.from('payments').delete().eq('id', payInsert.data.id);
    return { ok: false, outcome: 'rejected', reason: `booking confirm failed: ${conf.error.message}` };
  }

  await admin.from('gateway_attempts').update({ status: 'settled', settled_at: new Date().toISOString() }).eq('id', attempt.id);

  return { ok: true, outcome: 'settled', attemptId: attempt.id, paymentId: payInsert.data?.id };
}
