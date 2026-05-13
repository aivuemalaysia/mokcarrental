DROP POLICY IF EXISTS "Service can manage car images" ON car_images;

CREATE POLICY "Service role can manage car images" ON car_images
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

