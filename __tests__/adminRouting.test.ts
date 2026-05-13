import { getAdminRedirect } from '@/lib/adminRouting';

describe('getAdminRedirect', () => {
  test('returns null for non-admin paths', () => {
    expect(getAdminRedirect('/', false)).toBeNull();
    expect(getAdminRedirect('/cars', true)).toBeNull();
  });

  test('redirects unauthenticated users to /admin/login', () => {
    expect(getAdminRedirect('/admin/dashboard', false)).toBe('/admin/login');
    expect(getAdminRedirect('/admin/cars', false)).toBe('/admin/login');
  });

  test('does not redirect authenticated users on admin pages', () => {
    expect(getAdminRedirect('/admin/dashboard', true)).toBeNull();
    expect(getAdminRedirect('/admin/cars', true)).toBeNull();
  });

  test('redirects authenticated users away from /admin/login', () => {
    expect(getAdminRedirect('/admin/login', true)).toBe('/admin/dashboard');
  });
});
