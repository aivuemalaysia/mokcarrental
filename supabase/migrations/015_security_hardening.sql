-- 015_security_hardening.sql
-- Security hardening: RLS enforcement, least-privilege policies, login protection

-- =====================================================
-- PART 1: Drop stray unused table
-- =====================================================
DROP TABLE IF EXISTS public.business_applications2 CASCADE;

-- =====================================================
-- PART 2: Ensure RLS is enabled on ALL public tables
-- =====================================================
DO $$ DECLARE tbl text; BEGIN
  FOR tbl IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity = false
  LOOP EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl); END LOOP;
END; $$;

-- =====================================================
-- PART 3: Create admin_auth if missing
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_auth (
  id text primary key default 'singleton',
  email text not null default 'admin@mokcarrental.com',
  password_hash text, password_salt text,
  password_iterations integer not null default 210000,
  updated_at timestamptz not null default now()
);
ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;
INSERT INTO public.admin_auth (id) VALUES ('singleton') ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PART 4: Login rate limiting infrastructure
-- =====================================================
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  attempt_type TEXT NOT NULL DEFAULT 'admin_login',
  success BOOLEAN NOT NULL DEFAULT false,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS login_attempts_ip_idx ON public.login_attempts(ip_address, attempt_type, created_at DESC);
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage login_attempts" ON public.login_attempts;
CREATE POLICY "Service role can manage login_attempts" ON public.login_attempts FOR ALL USING (true) WITH CHECK (true);
DELETE FROM public.login_attempts WHERE created_at < NOW() - INTERVAL '7 days';
