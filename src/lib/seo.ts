/**
 * Canonical SEO URLs are always on the public marketing website, never
 * a temporary Vercel Preview hostname or the separate MOK booking PWA.
 */
export const SEO_ORIGIN = 'https://www.mokcarrental.com';

export const STATIC_INDEXABLE_PATHS = [
  '/',
  '/cars',
  '/booking',
  '/about',
  '/contact',
  '/faq',
  '/start-business',
  '/terms',
  '/privacy',
  '/senai-airport-car-rental',
  '/toyota-alphard-rental-jb',
] as const;

/** Validate legacy website car IDs before sending them to the UUID database column. */
export function isLegacyVehicleId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function canonicalFor(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('?') || path.includes('#')) {
    throw new Error('Canonical must be an absolute pathname without query or hash');
  }
  return new URL(path === '/' ? '/' : path.replace(/\/+$/, ''), SEO_ORIGIN).toString();
}
