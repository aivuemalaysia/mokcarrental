const mockFrom = jest.fn();
const mockCreateClient = jest.fn(() => ({ from: mockFrom }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('/api/admin/content/pickup-locations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
  });

  test('PUT rejects empty title', async () => {
    const { PUT } = await import('@/app/api/admin/content/pickup-locations/route');

    const req = new Request('http://localhost/api/admin/content/pickup-locations', {
      method: 'PUT',
      headers: { cookie: 'admin_token=admin-token-test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '', items: [{ id: 'a', label: 'A' }] }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  test('PUT rejects empty items', async () => {
    const { PUT } = await import('@/app/api/admin/content/pickup-locations/route');

    const req = new Request('http://localhost/api/admin/content/pickup-locations', {
      method: 'PUT',
      headers: { cookie: 'admin_token=admin-token-test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Pickup Locations', items: [] }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  test('PUT upserts items payload', async () => {
    const { PUT } = await import('@/app/api/admin/content/pickup-locations/route');

    const singleMock = jest.fn(async () => ({ data: { key: 'pickup_locations' }, error: null }));
    const selectMock = jest.fn(() => ({ single: singleMock }));
    const upsertMock = jest.fn(() => ({ select: selectMock }));

    mockFrom.mockImplementation((table: string) => {
      if (table === 'content_sections') return { upsert: upsertMock };
      if (table === 'audit_logs') return { insert: async () => ({ error: null }) };
      return {};
    });

    const req = new Request('http://localhost/api/admin/content/pickup-locations', {
      method: 'PUT',
      headers: { cookie: 'admin_token=admin-token-test', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Pickup Locations',
        items: [
          { id: 'office', label: 'Mok Car Rental Office - Taman Molek' },
          { id: 'senai', label: 'Senai Airport (Arrival Hall)' },
        ],
      }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);

    const payload = upsertMock.mock.calls[0][0];
    expect(payload.key).toBe('pickup_locations');
    expect(Array.isArray(payload.items)).toBe(true);
    expect(payload.items).toHaveLength(2);
    expect(payload.content_html).toBeNull();
  });
});

