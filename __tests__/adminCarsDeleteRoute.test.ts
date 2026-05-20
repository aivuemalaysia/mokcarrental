const mockFrom = jest.fn();
const mockCreateClient = jest.fn(() => ({ from: mockFrom }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('/api/admin/cars/[id] DELETE', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
  });

  test('returns 401 when not authenticated', async () => {
    const { DELETE } = await import('@/app/api/admin/cars/[id]/route');
    const req = new Request('http://localhost/api/admin/cars/1', { method: 'DELETE' });
    const res = await DELETE(req, { params: { id: '1' } });
    expect(res.status).toBe(401);
  });

  test('deletes inquiries then deletes car', async () => {
    const { DELETE } = await import('@/app/api/admin/cars/[id]/route');

    const deleteEq = jest.fn(async () => ({ error: null }));
    const inquiriesEq = jest.fn(async () => ({ error: null }));

    mockFrom.mockImplementation((table: string) => {
      if (table === 'inquiries') {
        return {
          delete: () => ({ eq: inquiriesEq }),
        };
      }
      if (table === 'cars') {
        return {
          delete: () => ({
            eq: deleteEq,
          }),
        };
      }
      return {};
    });

    const req = new Request('http://localhost/api/admin/cars/1', {
      method: 'DELETE',
      headers: { cookie: 'admin_token=admin-token-test' },
    });
    const res = await DELETE(req, { params: { id: '1' } });
    expect(res.status).toBe(200);
    expect(inquiriesEq).toHaveBeenCalledWith('car_id', '1');
    expect(deleteEq).toHaveBeenCalledWith('id', '1');
  });
});
