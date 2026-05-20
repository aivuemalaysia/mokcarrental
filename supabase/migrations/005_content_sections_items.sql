ALTER TABLE content_sections
  ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE content_sections
  ALTER COLUMN content_html DROP NOT NULL;

