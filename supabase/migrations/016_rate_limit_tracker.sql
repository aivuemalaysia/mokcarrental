-- Rate limit tracker table for database-backed rate limiting
CREATE TABLE IF NOT EXISTS rate_limit_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT rate_limit_tracker_key_count UNIQUE (key, created_at)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_tracker_key_created ON rate_limit_tracker(key, created_at DESC);

-- Cleanup old entries automatically
CREATE OR REPLACE FUNCTION cleanup_rate_limit_entries()
RETURNS VOID AS 
BEGIN
  DELETE FROM rate_limit_tracker WHERE created_at < NOW() - INTERVAL '24 hours';
END;
 LANGUAGE plpgsql;

-- Schedule cleanup to run every hour
SELECT pg_notify('pgrst', 'reload schema');
