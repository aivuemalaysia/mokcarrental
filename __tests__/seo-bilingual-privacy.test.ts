import fs from 'node:fs';
import path from 'node:path';

const source = (file: string) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Website bilingual privacy notice and company identity', () => {
  const privacy = source('src/app/privacy/page.tsx');
  const controller = source('src/lib/legalIdentity.ts');
  const contact = source('src/app/contact/page.tsx');
  const footer = source('src/components/Footer.tsx');

  it('identifies the named company in the Privacy page and footer', () => {
    expect(controller).toContain("MOK_REGISTERED_COMPANY_NAME = 'Mok Car Group (M) Sdn Bhd'");
    expect(privacy).toContain('{MOK_REGISTERED_COMPANY_NAME}');
    expect(footer).toContain('Registered company / Syarikat berdaftar');
    expect(footer).toContain('{MOK_REGISTERED_COMPANY_NAME}');
  });

  it('presents readable English and Bahasa Malaysia notices', () => {
    expect(privacy).toContain("language: 'en' | 'ms'");
    expect(privacy).toContain('language="en"');
    expect(privacy).toContain('language="ms"');
    expect(privacy).toContain('Privacy Notice (English)');
    expect(privacy).toContain('Notis Privasi (Bahasa Malaysia)');
    expect(privacy).toContain('Pemprosesan di luar Malaysia');
    expect(privacy).toContain('Processing outside Malaysia');
    expect(privacy).toContain("canonical: '/privacy'");
  });

  it('provides bilingual data notice before submitting an enquiry', () => {
    const marker = contact.indexOf('<form onSubmit={handleSubmit} className="space-y-6">');
    const field = contact.indexOf('htmlFor="contact-name"');
    const english = contact.indexOf('<Link href="/privacy"');
    const malay = contact.indexOf('<Link href="/privacy#notis-privasi"');
    expect(marker).toBeGreaterThan(-1);
    expect(english).toBeGreaterThan(marker);
    expect(malay).toBeGreaterThan(english);
    expect(field).toBeGreaterThan(malay);
    expect(contact).toContain("fetch('/api/contact'");
  });

  it('retains separate MOK PWA policy handoff without inventing rental rules', () => {
    expect(privacy).toContain('https://app.mokcarrental.com/terms');
    expect(privacy).not.toContain('January 2024');
    expect(privacy).not.toContain('RM200-500');
  });
});
