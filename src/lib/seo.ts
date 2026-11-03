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

export function canonicalFor(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('?') || path.includes('#')) {
    throw new Error('Canonical must be an absolute pathname without query or hash');
  }
  return new URL(path === '/' ? '/' : path.replace(/\/+$/, ''), SEO_ORIGIN).toString();
}
