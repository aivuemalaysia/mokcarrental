export function getAdminRedirect(pathname: string, hasToken: boolean) {
  if (!pathname.startsWith('/admin')) return null;

  if (pathname === '/admin/login') {
    return hasToken ? '/admin/dashboard' : null;
  }

  return hasToken ? null : '/admin/login';
}
