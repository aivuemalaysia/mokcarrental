CREATE TABLE IF NOT EXISTS car_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  original_path TEXT NOT NULL,
  medium_path TEXT NOT NULL,
  thumb_path TEXT NOT NULL,
  original_url TEXT NOT NULL,
  medium_url TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  bytes INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS car_images_car_id_idx ON car_images(car_id);
CREATE UNIQUE INDEX IF NOT EXISTS car_images_car_id_sort_order_idx ON car_images(car_id, sort_order);

ALTER TABLE car_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view car images" ON car_images
  FOR SELECT USING (true);

CREATE POLICY "Service can manage car images" ON car_images
  FOR ALL USING (true) WITH CHECK (true);

