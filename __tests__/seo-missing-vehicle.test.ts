import fs from 'node:fs';
import path from 'node:path';

describe('Vehicle SEO HTTP failure semantics', () => {
  const src = fs.readFileSync(path.join(process.cwd(), 'src/app/cars/[id]/page.tsx'), 'utf8');
  it('uses Next.js real 404 handling for missing cars', () => {
    expect(src).toContain('if (!car) notFound();');
    expect(src).not.toContain('<h1 className="text-3xl font-bold mb-4">Car Not Found</h1>');
  });
  it('does not swallow database failures as missing cars', () => {
    expect(src).toContain('.maybeSingle();');
    expect(src).toContain('if (error) throw error;');
    expect(src).toContain('robots: { index: false, follow: false }');
  });
});
