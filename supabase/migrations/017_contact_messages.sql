-- 017_contact_messages.sql
-- Separate "Send Us a Message" contact form submissions from booking inquiries.

CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service can insert contacts" ON contacts;
CREATE POLICY "Service can insert contacts" ON contacts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view contacts" ON contacts;
CREATE POLICY "Admin can view contacts" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON contacts (created_at DESC);
