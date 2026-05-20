import { POST } from '@/app/api/admin/logout/route';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';

describe('/api/admin/logout', () => {
  test('clears auth cookie', async () => {
    const response = await POST();
    expect(response.status).toBe(200);

    const setCookie = response.headers.get('set-cookie') || '';
    expect(setCookie).toContain(`${ADMIN_TOKEN_COOKIE}=`);
    expect(setCookie.toLowerCase()).toContain('httponly');
    expect(setCookie.toLowerCase()).toContain('max-age=0');
  });
});

