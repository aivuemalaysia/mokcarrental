describe('/api/admin/cars/[id]/images', () => {
  test('GET requires admin cookie', async () => {
    const { GET } = await import('@/app/api/admin/cars/[id]/images/route');
    const req = new Request('http://localhost/api/admin/cars/1/images');
    const res = await GET(req, { params: { id: '1' } } as any);
    expect(res.status).toBe(401);
  });

  test('POST requires admin cookie', async () => {
    const { POST } = await import('@/app/api/admin/cars/[id]/images/route');
    const req = new Request('http://localhost/api/admin/cars/1/images', { method: 'POST' });
    const res = await POST(req, { params: { id: '1' } } as any);
    expect(res.status).toBe(401);
  });
});

