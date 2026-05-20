const mockMaybeSingle = jest.fn();
const mockSelect = jest.fn(() => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }));
const mockUpsert = jest.fn();
const mockFrom = jest.fn(() => ({ select: mockSelect, upsert: mockUpsert }));
const mockCreateClient = jest.fn(() => ({ from: mockFrom }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('/api/admin/password', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
    delete process.env.ADMIN_PASSWORD_HASH;
    delete process.env.ADMIN_PASSWORD_SALT;
    delete process.env.ADMIN_PASSWORD_ITERATIONS;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns 401 when not authenticated', async () => {
    const { POST } = await import('@/app/api/admin/password/route');
    const req = new Request('http://localhost/api/admin/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: 'admin123', newPassword: 'mok8092', confirmPassword: 'mok8092' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  test('updates password when current password is valid', async () => {
    const { POST } = await import('@/app/api/admin/password/route');

    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockUpsert.mockResolvedValue({ data: { id: 'singleton' }, error: null });

    const req = new Request('http://localhost/api/admin/password', {
      method: 'POST',
      headers: { cookie: 'admin_token=admin-token-test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: 'admin123', newPassword: 'mok8092', confirmPassword: 'mok8092' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalled();
  });

  test('returns 401 when current password is wrong', async () => {
    const { POST } = await import('@/app/api/admin/password/route');

    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const req = new Request('http://localhost/api/admin/password', {
      method: 'POST',
      headers: { cookie: 'admin_token=admin-token-test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: 'wrong123', newPassword: 'mok8092', confirmPassword: 'mok8092' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});

