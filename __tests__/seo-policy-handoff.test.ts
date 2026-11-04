import fs from 'node:fs';
import path from 'node:path';

describe('SEO website policy handoff safety', () => {
  const terms = fs.readFileSync(path.join(process.cwd(), 'src/app/terms/page.tsx'), 'utf8');
  it('preserves the existing indexable terms URL and links to the PWA terms', () => {
    expect(terms).toContain("canonical: '/terms'");
    expect(terms).toContain('https://app.mokcarrental.com/terms');
    expect(terms).toContain('Online bookings are handled in MOK PWA');
  });
  it('does not claim historical fixed fees as current policy', () => {
    for (const claim of ['RM200-500', 'RM0.30-0.50/km', 'Free cancellation up to 48 hours', 'Last updated: January 2024']) {
      expect(terms).not.toContain(claim);
    }
  });
});
