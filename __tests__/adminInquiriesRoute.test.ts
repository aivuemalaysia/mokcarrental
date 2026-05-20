const mockFrom = jest.fn();
const mockCreateClient = jest.fn(() => ({ from: mockFrom }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('/api/admin/inquiries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
  });

  test('GET returns 401 when not authenticated', async () => {
    const { GET } = await import('@/app/api/admin/inquiries/route');
    const req = new Request('http://localhost/api/admin/inquiries', { method: 'GET' });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  test('GET returns inquiries when authenticated', async () => {
    const { GET } = await import('@/app/api/admin/inquiries/route');

    const orderMock = jest.fn(async () => ({ data: [{ id: '1' }], error: null }));
    const selectMock = jest.fn(() => ({ order: orderMock }));
    mockFrom.mockImplementation((table: string) => {
      if (table === 'inquiries') return { select: selectMock };
      return {};
    });

    const req = new Request('http://localhost/api/admin/inquiries', {
      method: 'GET',
      headers: { cookie: 'admin_token=admin-token-test' },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });
});

describe('/api/admin/inquiries/[id] PUT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
  });

  test('updates status and emits event', async () => {
    const { PUT } = await import('@/app/api/admin/inquiries/[id]/route');

    const updateSingle = jest.fn(async () => ({ data: { id: '1' }, error: null }));
    const updateSelect = jest.fn(() => ({ single: updateSingle }));
    const updateEq = jest.fn(() => ({ select: updateSelect }));
    const updateMock = jest.fn(() => ({ eq: updateEq }));

    const eventSingle = jest.fn(async () => ({ data: { id: 'e1' }, error: null }));
    const eventSelect = jest.fn(() => ({ single: eventSingle }));
    const eventInsert = jest.fn(() => ({ select: eventSelect }));

    mockFrom.mockImplementation((table: string) => {
      if (table === 'inquiries') return { update: updateMock };
      if (table === 'inquiries_events') return { insert: eventInsert };
      return {};
    });

    const req = new Request('http://localhost/api/admin/inquiries/1', {
      method: 'PUT',
      headers: { cookie: 'admin_token=admin-token-test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' }),
    });

    const res = await PUT(req, { params: { id: '1' } });
    expect(res.status).toBe(200);
    expect(updateMock).toHaveBeenCalled();
    expect(eventInsert).toHaveBeenCalled();
  });
});

