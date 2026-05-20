ALTER TABLE cars ADD COLUMN IF NOT EXISTS status TEXT;

UPDATE cars
SET status = CASE WHEN available THEN 'available' ELSE 'unavailable' END
WHERE status IS NULL;

ALTER TABLE cars ALTER COLUMN status SET DEFAULT 'available';

ALTER TABLE cars ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cars_status_check'
  ) THEN
    ALTER TABLE cars
    ADD CONSTRAINT cars_status_check CHECK (status IN ('available', 'unavailable', 'maintenance'));
  END IF;
END;
$$;
