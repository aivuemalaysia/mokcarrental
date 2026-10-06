-- 020: bookings table with Postgres exclusion constraint.
--
-- Purpose:
--   Prevent two overlapping confirmed rentals of the same car from coexisting
--   in the database. This is the "bookings" table item from the Phase 0 audit
--   doc, pulled forward into Phase 1 so the overlap check is enforced at the
--   database level, not just application logic.
--
-- How it works:
--   btree_gist extension enables range-type exclusion constraints.
--   Each row carries a tsrange (period) for the rental window and the car_id.
--   The exclusion constraint says: for the same car_id, no two rows may have
--   overlapping periods. Status='confirmed' rows are the ones that matter;
--   'pending' and 'cancelled' rows are excluded from the constraint check via
--   a partial index predicate.
--
-- Safe to re-run: CREATE TABLE IF NOT EXISTS + CREATE EXTENSION IF NOT EXISTS.

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id        UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  pickup_date   DATE NOT NULL,
  return_date   DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  period        TSRANGE NOT NULL
                GENERATED ALWAYS AS (tsrange(
                  pickup_date::timestamp,
                  return_date::timestamp
                )) STORED,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- No two overlapping confirmed bookings for the same car.
  CONSTRAINT no_double_booking
    EXCLUDE USING gist (
      car_id        WITH =,
      period        WITH &&
    )
    WHERE (status = 'confirmed')
);

-- Index for the one-tap rebook lookup path (car + date range).
CREATE INDEX IF NOT EXISTS idx_bookings_car_period
  ON bookings (car_id, period);

-- Keep updated_at in sync.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings;
CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
