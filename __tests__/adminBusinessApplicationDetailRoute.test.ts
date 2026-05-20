describe('/api/admin/business-applications/[id]', () => {
  test('GET requires admin cookie', async () => {
    const { GET } = await import('@/app/api/admin/business-applications/[id]/route');
    const req = new Request('http://localhost/api/admin/business-applications/1');
    const res = await GET(req, { params: { id: '1' } } as any);
    expect(res.status).toBe(401);
  });

  test('PUT requires admin cookie', async () => {
    const { PUT } = await import('@/app/api/admin/business-applications/[id]/route');
    const req = new Request('http://localhost/api/admin/business-applications/1', { method: 'PUT' });
    const res = await PUT(req, { params: { id: '1' } } as any);
    expect(res.status).toBe(401);
  });
});

