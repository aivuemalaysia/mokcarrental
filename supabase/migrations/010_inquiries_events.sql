CREATE TABLE IF NOT EXISTS inquiries_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('inquiry_created', 'inquiry_updated')),
  inquiry_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE inquiries_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view inquiry events" ON inquiries_events;
CREATE POLICY "Public can view inquiry events" ON inquiries_events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service can insert inquiry events" ON inquiries_events;
CREATE POLICY "Service can insert inquiry events" ON inquiries_events
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS inquiries_events_created_at_idx ON inquiries_events (created_at DESC);
