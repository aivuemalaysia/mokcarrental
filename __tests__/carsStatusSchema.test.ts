import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const testIf = url && key ? test : test.skip;

describe('Supabase schema: cars.status', () => {
  testIf('selecting status column succeeds', async () => {
    const client = createClient(url as string, key as string, { auth: { persistSession: false } });
    const { error } = await client.from('cars').select('status').limit(1);
    expect(error).toBeNull();
  });
});
