import { POST } from '@/app/api/admin/login/route';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';

describe('/api/admin/login', () => {
  test('returns 401 for invalid credentials', async () => {
    const request = new Request('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'x@y.com', password: 'nope' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  test('sets auth cookie for valid credentials', async () => {
    const request = new Request('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mokcarrental.com', password: 'admin123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const setCookie = response.headers.get('set-cookie') || '';
    expect(setCookie).toContain(`${ADMIN_TOKEN_COOKIE}=`);
    expect(setCookie.toLowerCase()).toContain('httponly');
  });
});
