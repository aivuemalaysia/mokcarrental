CREATE TABLE IF NOT EXISTS content_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content_html TEXT NOT NULL,
  updated_by_email TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active content sections" ON content_sections
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Service can insert content sections" ON content_sections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update content sections" ON content_sections
  FOR UPDATE USING (true);

CREATE OR REPLACE FUNCTION update_content_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_content_sections_updated_at ON content_sections;

CREATE TRIGGER update_content_sections_updated_at
  BEFORE UPDATE ON content_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_content_sections_updated_at();

