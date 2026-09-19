--- Migration: 018_restore_public_fleet_reads

-- Restore PUBLIC (anon) read access to the car fleet.
--
-- supabase-security-fix.sql enabled RLS on every app table and dropped all
-- permissive anon policies, which is correct for user-submitted data
-- (inquiries, contacts, business applications).
--
-- BUT the public fleet (cars + car_images) IS the website's public content.
-- The site's client components (car listings, car images, fleet UI) read
-- these two tables with the anon key, and that broke after the lockdown:
--   * /cars rendered "0 of 0 available cars"
--   * car detail pages fell back to "Car Not Found"
--   * sitemap.ts found no cars (server-side fetch failed)
--
-- Run this in the Supabase dashboard SQL editor AFTER supabase-security-fix.sql.
-- Safe to re-run: every statement is idempotent.

-- 1. Allow anonymous (public) reads of the active fleet.
--    available = true filters out admin-hid cars; deleted_at = null excludes
--    soft-deleted rows. Service role (used by admin APIs) already bypasses RLS.
create or replace policy "Public can view available cars"
  on public.cars
  for select to anon
  using (available = true and deleted_at is null);

create or replace policy "Public can view available car images"
  on public.car_images
  for select to anon
  using (deleted_at is null);

-- 2. Force PostgREST to refresh its schema cache so new policies apply.
select public.pgrst_reload_schema();

-- 3. Verify (should return 1 and 1 after the policies are live).
select count(*) as anon_policy_count
from pg_policy
where tablename = 'cars'
  and coalesce(roles::text, '') like '%anon%';

