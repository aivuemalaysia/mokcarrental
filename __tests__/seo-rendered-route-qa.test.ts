import fs from 'node:fs';
import path from 'node:path';
import { isLegacyVehicleId, SEO_ORIGIN, MOK_SOCIAL_IMAGE } from '@/lib/seo';

describe('MOK SEO rendered-route risk regression', () => {
  it('rejects malformed vehicle IDs before the database query', () => {
    expect(isLegacyVehicleId('11b5e382-59b9-42f1-825c-566369103882')).toBe(true);
    expect(isLegacyVehicleId('00000000-0000-4000-8000-000000000000')).toBe(true);
    for (const invalid of ['invalid-ID', 'not-a-uuid', '', 'a'.repeat(36), '11b5e382-59b9-42f1-825c-566369103882?x=1']) {
      expect(isLegacyVehicleId(invalid)).toBe(false);
    }
  });

  it('does not use Vercel Preview hostnames for share-card images', () => {
    const layout = fs.readFileSync(path.join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
    expect(layout).toContain('images: [MOK_SOCIAL_IMAGE]');
    expect(layout).toContain('images: [MOK_SOCIAL_IMAGE.url]');
    expect(MOK_SOCIAL_IMAGE.url).toBe('https://www.mokcarrental.com/brand/mok-hero-2026.webp');
    for (const file of ['src/app/page.tsx', 'src/app/senai-airport-car-rental/page.tsx', 'src/app/toyota-alphard-rental-jb/page.tsx', 'src/app/cars/page.tsx']) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toContain('images:');
      expect(source).toContain('MOK_SOCIAL_IMAGE');
    }
    expect(SEO_ORIGIN).toBe('https://www.mokcarrental.com');
  });

  it('shows the complete brand in the homepage HTML title', () => {
    const home = fs.readFileSync(path.join(process.cwd(), 'src/app/page.tsx'), 'utf8');
    expect(home).toContain("title: 'Car Rental Johor Bahru (JB) | MOK Car Rental'");
  });

  it('correctly names the website rental listing as information only', () => {
    const listing = fs.readFileSync(path.join(process.cwd(), 'src/app/cars/cars-client.tsx'), 'utf8');
    expect(listing).toContain('Rental Vehicle Information in Johor Bahru');
    expect(listing).toContain('Actual models, rental prices');
    expect(listing).not.toContain('premium selection of well-maintained rental vehicles');
  });

  it('does not mislabel the PWA terms page as a privacy policy', () => {
    const privacy = fs.readFileSync(path.join(process.cwd(), 'src/app/privacy/page.tsx'), 'utf8');
    expect(privacy).toContain('Review MOK PWA booking terms');
    expect(privacy).not.toContain('Review MOK booking terms and privacy information');
  });
});
