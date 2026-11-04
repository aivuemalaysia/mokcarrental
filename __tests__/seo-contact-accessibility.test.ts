import fs from 'node:fs';
import path from 'node:path';

describe('MOK website contact form accessibility', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'src/app/contact/page.tsx'), 'utf8');
  it('associates four visible field labels with their controls', () => {
    for (const id of ['contact-name', 'contact-email', 'contact-phone', 'contact-message']) {
      expect(source).toContain(`htmlFor="${id}"`);
      expect(source).toContain(`id="${id}"`);
    }
  });
  it('enables native required-field and email validation before submission', () => {
    expect(source).toContain('<form onSubmit={handleSubmit} className="space-y-6">');
    expect(source).not.toContain('noValidate');
    expect(source).toContain('type="email"');
    expect((source.match(/\brequired\b/g) || []).length).toBeGreaterThanOrEqual(4);
  });
  it('announces submission error and success accessibly, without changing backend route', () => {
    expect(source).toContain('role="alert"');
    expect(source).toContain('role="status"');
    expect(source).toContain("fetch('/api/contact'");
    expect(source).not.toContain('Most Singaporean customers reach us');
  });
});
