DROP POLICY IF EXISTS "Anyone can create inquiries" ON inquiries;

CREATE POLICY "Service can create inquiries" ON inquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view inquiries" ON inquiries;
CREATE POLICY "Service can view inquiries" ON inquiries
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage inquiries" ON inquiries;
CREATE POLICY "Service can manage inquiries" ON inquiries
  FOR UPDATE USING (true) WITH CHECK (true);
