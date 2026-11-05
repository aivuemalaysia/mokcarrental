export {};

// A real CSRF token must still match between cookie and header; never stub validation.
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) => name === 'csrf_token' ? { value: 'qa-csrf-test' } : undefined,
  }),
}));

const mockFrom = jest.fn();
const mockCreateClient = jest.fn((..._args: unknown[]) => ({ from: mockFrom }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('/api/admin/cars POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
  });

  test('returns 401 when not authenticated', async () => {
    const { POST } = await import('@/app/api/admin/cars/route');
    const req = new Request('http://localhost/api/admin/cars', { method: 'POST', body: '{}' });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  test('maps status=maintenance to available=false', async () => {
    const { POST } = await import('@/app/api/admin/cars/route');

    const insertMock = jest.fn((_rows: Array<Record<string, unknown>>) => ({
      select: () => ({
        single: async () => ({ data: { id: '1' }, error: null }),
      }),
    }));

    mockFrom.mockReturnValue({ insert: insertMock });

    const req = new Request('http://localhost/api/admin/cars', {
      method: 'POST',
      headers: { cookie: 'admin_token=admin-token-test', 'x-csrf-token': 'qa-csrf-test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Demo', status: 'maintenance' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const inserted = insertMock.mock.calls[0][0][0];
    expect(inserted.status).toBe('maintenance');
    expect(inserted.available).toBe(false);
  });

  test('rejects authenticated car POST when the CSRF header does not match the cookie', async () => {
    const { POST } = await import('@/app/api/admin/cars/route');
    const req = new Request('http://localhost/api/admin/cars', {
      method: 'POST',
      headers: { cookie: 'admin_token=admin-token-test', 'x-csrf-token': 'incorrect', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Demo', status: 'available' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
