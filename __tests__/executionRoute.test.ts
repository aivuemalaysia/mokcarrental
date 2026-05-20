const mockFrom = jest.fn();
const mockRpc = jest.fn();
const mockAuthGetUser = jest.fn();

const mockCreateClient = jest.fn(() => ({
  from: mockFrom,
  rpc: mockRpc,
  auth: { getUser: mockAuthGetUser },
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('/api/execution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
  });

  test('rejects when missing bearer token', async () => {
    const { POST } = await import('@/app/api/execution/route');
    const req = new Request('http://localhost/api/execution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ op: 'supabase.reload_schema_cache', input: {} }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  test('rejects forbidden role', async () => {
    const { POST } = await import('@/app/api/execution/route');

    mockAuthGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'u1@test.com' } }, error: null });

    const maybeSingleRole = jest.fn(async () => ({ data: { role: 'user' }, error: null }));
    const selectRole = jest.fn(() => ({ eq: () => ({ maybeSingle: maybeSingleRole }) }));

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') return { select: selectRole };
      if (table === 'audit_logs') return { insert: async () => ({ error: null }) };
      return {};
    });

    const req = new Request('http://localhost/api/execution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: 'Bearer token' },
      body: JSON.stringify({ op: 'supabase.reload_schema_cache', input: {} }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  test('executes reload schema op for allowed role', async () => {
    const { POST } = await import('@/app/api/execution/route');

    mockAuthGetUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'u1@test.com' } }, error: null });

    const maybeSingleRole = jest.fn(async () => ({ data: { role: 'admin' }, error: null }));
    const selectRole = jest.fn(() => ({ eq: () => ({ maybeSingle: maybeSingleRole }) }));

    mockRpc.mockResolvedValue({ data: true, error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'user_roles') return { select: selectRole };
      if (table === 'audit_logs') return { insert: async () => ({ error: null }) };
      return {};
    });

    const req = new Request('http://localhost/api/execution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: 'Bearer token' },
      body: JSON.stringify({ op: 'supabase.reload_schema_cache', input: {} }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('pgrst_reload_schema');
  });
});

