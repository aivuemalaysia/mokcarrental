import fs from 'node:fs';
import path from 'node:path';

describe('MOK SEO marketing content accuracy', () => {
  function source(file: string) {
    return fs.readFileSync(path.join(process.cwd(), file), 'utf8');
  }
  it('routes bookings through MOK PWA in Contact metadata', () => {
    const contact = source('src/app/contact/layout.tsx');
    expect(contact).toContain('book through MOK PWA');
    expect(contact).not.toContain('Book via WhatsApp, phone, or email');
  });
  it('does not advertise stale stock as guaranteed availability', () => {
    const cars = source('src/app/cars/page.tsx');
    expect(cars).toContain('Check live cars, pricing and booking terms in MOK PWA');
    expect(cars).not.toContain('available for daily rental');
  });
  it('does not imply automatic cross-border car rental permission', () => {
    const about = source('src/app/about/page.tsx');
    expect(about).toContain('confirm any border-crossing restrictions');
    expect(about).not.toContain('Our cars are always ready');
  });
});
