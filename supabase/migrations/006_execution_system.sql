CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can manage user roles" ON user_roles
  FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION pgrst_reload_schema()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION pgrst_reload_schema() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION pgrst_reload_schema() TO service_role;

