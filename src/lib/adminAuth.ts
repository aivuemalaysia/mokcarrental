export const ADMIN_EMAIL = 'admin@mokcarrental.com';
export const ADMIN_PASSWORD = 'admin123';
export const ADMIN_TOKEN_COOKIE = 'admin_token';

export function isValidAdminCredentials(email: string, password: string) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function createAdminToken() {
  return `admin-token-${crypto.randomUUID()}`;
}
