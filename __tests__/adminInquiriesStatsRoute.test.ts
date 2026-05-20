const mockFrom = jest.fn();
const mockCreateClient = jest.fn(() => ({ from: mockFrom }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

function thenable<T>(value: T) {
  return {
    then: (resolve: any) => Promise.resolve(resolve(value)),
  } as any;
}

describe('/api/admin/inquiries/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
  });

  test('GET returns 401 when not authenticated', async () => {
    const { GET } = await import('@/app/api/admin/inquiries/stats/route');
    const req = new Request('http://localhost/api/admin/inquiries/stats', { method: 'GET' });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  test('GET returns counts and eventsTableOk', async () => {
    const { GET } = await import('@/app/api/admin/inquiries/stats/route');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'inquiries') {
        return {
          select: (cols: string, opts?: any) => {
            if (opts?.head && opts?.count === 'exact' && cols === 'id') {
              return {
                eq: (field: string, value: string) => {
                  const count =
                    value === 'pending' ? 2 :
                    value === 'confirmed' ? 3 :
                    value === 'cancelled' ? 1 : 0;
                  return Promise.resolve({ count, error: null });
                },
                ...thenable({ count: 6, error: null }),
              };
            }

            if (cols === 'created_at') {
              const maybeSingle = jest.fn(async () => ({ data: { created_at: '2026-05-18T00:00:00Z' }, error: null }));
              const limit = jest.fn(() => ({ maybeSingle }));
              const order = jest.fn(() => ({ limit }));
              return { order };
            }

            return thenable({ data: null, error: null });
          },
        };
      }

      if (table === 'inquiries_events') {
        return {
          select: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        };
      }

      return {};
    });

    const req = new Request('http://localhost/api/admin/inquiries/stats', {
      method: 'GET',
      headers: { cookie: 'admin_token=admin-token-test' },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.total).toBe(6);
    expect(json.data.pending).toBe(2);
    expect(json.data.eventsTableOk).toBe(true);
  });
});

