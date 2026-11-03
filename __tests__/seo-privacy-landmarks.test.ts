import fs from 'node:fs';
import path from 'node:path';

describe('MOK marketing website privacy and landmark safety', () => {
  const appLayout = fs.readFileSync(path.join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
  const home = fs.readFileSync(path.join(process.cwd(), 'src/app/page.tsx'), 'utf8');
  const privacy = fs.readFileSync(path.join(process.cwd(), 'src/app/privacy/page.tsx'), 'utf8');
  it('avoids nested main landmarks and keeps the skip link', () => {
    expect(appLayout).toContain('<div id="main-content">{children}</div>');
    expect(appLayout).not.toContain('<main id="main-content">{children}</main>');
    expect(home).toContain('<main>');
    expect(home).toContain('</main>');
  });
  it('maintains canonical privacy page with the PWA handoff', () => {
    expect(privacy).toContain("canonical: '/privacy'");
    expect(privacy).toContain('https://app.mokcarrental.com/terms');
    expect(privacy).not.toContain('January 2024');
  });
});
