describe('/api/admin/cars/[id]/finalize', () => {
  test('POST requires admin cookie', async () => {
    const { POST } = await import('@/app/api/admin/cars/[id]/finalize/route');
    const req = new Request('http://localhost/api/admin/cars/1/finalize', { method: 'POST' });
    const res = await POST(req, { params: { id: '1' } } as any);
    expect(res.status).toBe(401);
  });

  test('POST rejects when images are below minimum', async () => {
    jest.resetModules();
    jest.doMock('@/lib/supabaseAdmin', () => ({
      getSupabaseAdminClient: () => ({
        from: () => ({
          select: () => ({
            eq: async () => ({ count: 2, error: null }),
          }),
        }),
      }),
    }));

    const { POST } = await import('@/app/api/admin/cars/[id]/finalize/route');
    const req = new Request('http://localhost/api/admin/cars/1/finalize', {
      method: 'POST',
      headers: { cookie: 'admin_token=admin-token-test' },
    });
    const res = await POST(req, { params: { id: '1' } } as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });

  test('POST succeeds when images meet minimum', async () => {
    jest.resetModules();
    jest.doMock('@/lib/supabaseAdmin', () => ({
      getSupabaseAdminClient: () => ({
        from: () => ({
          select: () => ({
            eq: async () => ({ count: 3, error: null }),
          }),
        }),
      }),
    }));

    const { POST } = await import('@/app/api/admin/cars/[id]/finalize/route');
    const req = new Request('http://localhost/api/admin/cars/1/finalize', {
      method: 'POST',
      headers: { cookie: 'admin_token=admin-token-test' },
    });
    const res = await POST(req, { params: { id: '1' } } as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});
