const mockCreateClient = jest.fn(() => ({}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('/api/business-applications POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
  });

  test('returns 400 when missing required fields', async () => {
    const { POST } = await import('@/app/api/business-applications/route');
    const form = new FormData();
    const req = new Request('http://localhost/api/business-applications', { method: 'POST', body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('returns 400 when missing car photos', async () => {
    const { POST } = await import('@/app/api/business-applications/route');
    const form = new FormData();
    form.set('ownerName', 'Alice');
    form.set('contactNumber', '+6012');
    const req = new Request('http://localhost/api/business-applications', { method: 'POST', body: form });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

