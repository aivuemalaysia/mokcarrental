const mockFrom = jest.fn();
const mockCreateClient = jest.fn(() => ({ from: mockFrom }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('/api/admin/content/why-choose', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
  });

  test('PUT rejects empty title', async () => {
    const { PUT } = await import('@/app/api/admin/content/why-choose/route');

    const req = new Request('http://localhost/api/admin/content/why-choose', {
      method: 'PUT',
      headers: { cookie: 'admin_token=admin-token-test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '', content_html: '<p>Hi</p>' }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(400);
  });

  test('PUT upserts sanitized content', async () => {
    const { PUT } = await import('@/app/api/admin/content/why-choose/route');

    const singleMock = jest.fn(async () => ({ data: { key: 'why_choose_us' }, error: null }));
    const selectMock = jest.fn(() => ({ single: singleMock }));
    const upsertMock = jest.fn(() => ({ select: selectMock }));

    mockFrom.mockImplementation((table: string) => {
      if (table === 'content_sections') return { upsert: upsertMock };
      if (table === 'audit_logs') return { insert: async () => ({ error: null }) };
      return {};
    });

    const req = new Request('http://localhost/api/admin/content/why-choose', {
      method: 'PUT',
      headers: { cookie: 'admin_token=admin-token-test', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Why Choose',
        content_html: '<p>Hello</p><script>alert(1)</script>',
      }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);

    const payload = upsertMock.mock.calls[0][0];
    expect(payload.key).toBe('why_choose_us');
    expect(payload.content_html).toContain('<p>Hello</p>');
    expect(payload.content_html).not.toContain('<script>');
  });

  test('PUT accepts 6 items and stores items payload', async () => {
    const { PUT } = await import('@/app/api/admin/content/why-choose/route');

    const singleMock = jest.fn(async () => ({ data: { key: 'why_choose_us' }, error: null }));
    const selectMock = jest.fn(() => ({ single: singleMock }));
    const upsertMock = jest.fn(() => ({ select: selectMock }));

    mockFrom.mockImplementation((table: string) => {
      if (table === 'content_sections') return { upsert: upsertMock };
      if (table === 'audit_logs') return { insert: async () => ({ error: null }) };
      return {};
    });

    const req = new Request('http://localhost/api/admin/content/why-choose', {
      method: 'PUT',
      headers: { cookie: 'admin_token=admin-token-test', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Why Choose',
        items: [
          { icon: 'dollar', title: 'Affordable', description: 'A' },
          { icon: 'smile', title: 'Clean', description: 'B' },
          { icon: 'truck', title: 'Delivery', description: 'C' },
          { icon: 'headphones', title: 'Support', description: 'D' },
          { icon: 'award', title: 'Trusted', description: 'E' },
          { icon: 'check', title: 'Easy', description: 'F' },
        ],
      }),
    });

    const res = await PUT(req);
    expect(res.status).toBe(200);

    const payload = upsertMock.mock.calls[0][0];
    expect(Array.isArray(payload.items)).toBe(true);
    expect(payload.items).toHaveLength(6);
    expect(payload.content_html).toContain('<ul>');
    expect(payload.content_html).toContain('<li>');
  });
});
