import fs from 'node:fs';
import path from 'node:path';

describe('MOK public SEO pages expose a single main landmark', () => {
  const routes = [
    'src/app/about/page.tsx',
    'src/app/contact/page.tsx',
    'src/app/faq/page.tsx',
    'src/app/terms/page.tsx',
    'src/app/privacy/page.tsx',
    'src/app/start-business/page.tsx',
    'src/app/cars/cars-client.tsx',
    'src/app/cars/[id]/page.tsx',
    'src/app/senai-airport-car-rental/page.tsx',
    'src/app/toyota-alphard-rental-jb/page.tsx',
  ];
  it.each(routes)('%s renders one main landmark', (file) => {
    const src = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
    expect(src.split('<main').length - 1).toBe(1);
    expect(src.split('</main>').length - 1).toBe(1);
  });

  it('keeps the shared skip-link target without introducing a nested root main', () => {
    const layout = fs.readFileSync(path.join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
    expect(layout).toContain('href="#main-content"');
    expect(layout).toContain('<div id="main-content">{children}</div>');
    expect(layout).not.toContain('<main id="main-content">{children}</main>');
  });
});
