-- Mok Car Rental - Supabase Schema

-- Cars table
CREATE TABLE cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  vin TEXT,
  status TEXT DEFAULT 'available',
  category TEXT NOT NULL CHECK (category IN ('economy', 'sedan', 'suv', 'mpv', 'luxury')),
  price DECIMAL(10, 2) NOT NULL,
  seats INTEGER NOT NULL,
  transmission TEXT NOT NULL CHECK (transmission IN ('automatic', 'manual')),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid')),
  image TEXT,
  images TEXT[],
  features TEXT[],
  description TEXT,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Sections table (CMS)
CREATE TABLE content_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content_html TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_by_email TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE car_images (
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

-- Inquiries table
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id TEXT,
  car_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT,
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  pickup_location TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;

-- Public read access for cars
CREATE POLICY "Public can view available cars" ON cars
  FOR SELECT USING (available = true);

-- Admin can do everything with cars
CREATE POLICY "Admin can manage cars" ON cars
  USING (auth.role() = 'authenticated');

-- Anyone can create inquiries
CREATE POLICY "Anyone can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

-- Only admin can view inquiries
CREATE POLICY "Admin can view inquiries" ON inquiries
  FOR SELECT USING (auth.role() = 'authenticated');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Public read access for content sections
CREATE POLICY "Public can view active content sections" ON content_sections
  FOR SELECT USING (deleted_at IS NULL);

-- System can insert/update content sections
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

CREATE TRIGGER update_content_sections_updated_at
  BEFORE UPDATE ON content_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_content_sections_updated_at();
