import { POST } from '@/app/api/admin/login/route';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';

beforeAll(() => {
  // Set a test admin password so we don't rely on hardcoded defaults
  process.env.ADMIN_PASSWORD = 'AdminTest123';
  process.env.NODE_ENV = 'test';
});

describe('/api/admin/login', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns 401 for invalid credentials', async () => {
    const request = new Request('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'x@y.com', password: 'nope123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  test('sets auth cookie for valid credentials', async () => {
    const request = new Request('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mokcarrental.com', password: 'AdminTest123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const setCookie = response.headers.get('set-cookie') || '';
    expect(setCookie).toContain(`${ADMIN_TOKEN_COOKIE}=`);
    expect(setCookie.toLowerCase()).toContain('httponly');

    const json = await response.json();
    expect(json.ok).toBe(true);
    expect(json.data?.user?.email).toBe('admin@mokcarrental.com');
  });
});
