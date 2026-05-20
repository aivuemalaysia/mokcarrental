describe('/api/admin/business-applications', () => {
  test('GET requires admin cookie', async () => {
    const { GET } = await import('@/app/api/admin/business-applications/route');
    const req = new Request('http://localhost/api/admin/business-applications');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

