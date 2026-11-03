import { canonicalFor, SEO_ORIGIN, STATIC_INDEXABLE_PATHS } from '@/lib/seo';

describe('MOK marketing website SEO contract', () => {
  it('uses the public website, never a preview domain or booking PWA', () => {
    expect(SEO_ORIGIN).toBe('https://www.mokcarrental.com');
    expect(canonicalFor('/')).toBe('https://www.mokcarrental.com/');
    expect(canonicalFor('/cars')).toBe('https://www.mokcarrental.com/cars');
    expect(canonicalFor('/senai-airport-car-rental')).toBe('https://www.mokcarrental.com/senai-airport-car-rental');
    expect(canonicalFor('/cars/51deb82e-613b-4897-be43-ee87b9921ba2')).toContain('/cars/');
  });

  it('rejects malformed canonicals and tracking parameters', () => {
    expect(() => canonicalFor('cars')).toThrow();
    expect(() => canonicalFor('//thirdparty.com')).toThrow();
    expect(() => canonicalFor('/cars?utm_source=paid')).toThrow();
    expect(() => canonicalFor('/cars#top')).toThrow();
  });

  it('keeps existing SEO URLs while excluding admin, API and old inquiry lookup routes', () => {
    for (const path of ['/', '/cars', '/booking', '/about', '/faq', '/contact', '/terms', '/privacy']) {
      expect(STATIC_INDEXABLE_PATHS).toContain(path);
    }
    expect(STATIC_INDEXABLE_PATHS.every((path) => !path.startsWith('/admin') && !path.startsWith('/api'))).toBe(true);
    expect((STATIC_INDEXABLE_PATHS as readonly string[]).includes('/my-bookings')).toBe(false);
    expect(new Set(STATIC_INDEXABLE_PATHS).size).toBe(STATIC_INDEXABLE_PATHS.length);
  });
});
