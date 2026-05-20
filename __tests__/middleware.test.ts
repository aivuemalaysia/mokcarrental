import { middleware } from '@/middleware';
import { ADMIN_TOKEN_COOKIE } from '@/lib/adminAuth';

function makeRequest(path: string, token?: string) {
  const url = new URL(`http://localhost${path}`);
  const headers = new Headers();
  if (token) headers.set('cookie', `${ADMIN_TOKEN_COOKIE}=${token}`);

  const request = {
    nextUrl: url,
    cookies: {
      get: (name: string) => {
        if (name !== ADMIN_TOKEN_COOKIE) return undefined;
        if (!token) return undefined;
        return { name, value: token };
      },
    },
    headers,
  } as any;

  return request;
}

describe('middleware admin auth', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('redirects unauthenticated admin page requests to /admin/login', async () => {
    const res = (await middleware(makeRequest('/admin/cars'))) as any;
    expect(res?.headers?.get('location')).toBe('http://localhost/admin/login');
  });

  test('allows authenticated admin page requests', async () => {
    const res = (await middleware(makeRequest('/admin/cars', 'admin-token-test'))) as any;
    expect(res?.headers?.get('location')).toBeNull();
  });

  test('redirects authenticated users away from /admin/login', async () => {
    const res = (await middleware(makeRequest('/admin/login', 'admin-token-test'))) as any;
    expect(res?.headers?.get('location')).toBe('http://localhost/admin/dashboard');
  });
});
