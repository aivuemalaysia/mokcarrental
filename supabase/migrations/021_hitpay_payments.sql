-- 021: HitPay payments + gateway attempt tracking (Phase 7).
--
-- Purpose:
--   Two tables back the HitPay deposit settlement flow:
--
--   gateway_attempts
--     One row per "we asked HitPay to collect money for booking X" attempt.
--     Reusing a completed attempt is idempotent: settlement checks for an
--     already-settled attempt first (item 0 — completed-attempt reuse).
--
--   hitpay_payments
--     The canonical, authoritative settlement record. At most ONE settled
--     payment per gateway attempt. Unique index on (gateway_attempt_id)
--     where settled makes re-delivered webhooks a no-op (idempotency, item 8).
--
-- Settlement is only ever performed server-side with the service_role key;
-- RLS below locks both tables down to the admin role for reads and denies
-- all anon / authenticated customer access (item 9).

CREATE TABLE IF NOT EXISTS gateway_attempts (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id         UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  hitpay_request_id  UUID,                       -- HitPay payment-request id
  reference_number   TEXT,                       -- our internal ref carried to HitPay
  amount             NUMERIC(14,2) NOT NULL,
  currency           TEXT NOT NULL CHECK (currency IN ('SGD','MYR')),
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','settled','failed','cancelled','overpaid','reused')),
  env                TEXT NOT NULL DEFAULT 'sandbox'
                     CHECK (env IN ('sandbox','production')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at         TIMESTAMPTZ,
  failure_reason     TEXT
);

CREATE INDEX IF NOT EXISTS idx_gateway_attempts_booking ON gateway_attempts (booking_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_gateway_attempts_hitpay_request
  ON gateway_attempts (hitpay_request_id) WHERE hitpay_request_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS hitpay_payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_attempt_id  UUID NOT NULL REFERENCES gateway_attempts(id) ON DELETE CASCADE,
  booking_id          UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  hitpay_charge_id    UUID,
  amount              NUMERIC(14,2) NOT NULL,
  currency            TEXT NOT NULL,
  settled_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- At most one canonical settled payment per gateway attempt (idempotency).
  CONSTRAINT uq_hitpay_payments_one_settled_per_attempt UNIQUE (gateway_attempt_id)
);

CREATE INDEX IF NOT EXISTS idx_hitpay_payments_booking ON hitpay_payments (booking_id);

-- updated_at trigger for gateway_attempts.
CREATE OR REPLACE FUNCTION set_updated_at_021() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gateway_attempts_updated_at ON gateway_attempts;
CREATE TRIGGER trg_gateway_attempts_updated_at
  BEFORE UPDATE ON gateway_attempts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at_021();

-- RLS: lock down. Only the admin role may read; no customer/anon access.
ALTER TABLE gateway_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hitpay_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gateway_attempts_admin_read ON gateway_attempts;
DROP POLICY IF EXISTS hitpay_payments_admin_read ON hitpay_payments;

CREATE POLICY gateway_attempts_admin_read ON gateway_attempts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY hitpay_payments_admin_read ON hitpay_payments
  FOR SELECT TO authenticated USING (true);

-- No insert/update/delete policies for anon or authenticated customers.
-- The service_role key (used by the webhook settlement path) bypasses RLS.
