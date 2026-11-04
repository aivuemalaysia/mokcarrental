import fs from 'node:fs';
import path from 'node:path';

describe('MOK public fleet filters provide accessible names and state', () => {
  const listing = fs.readFileSync(path.join(process.cwd(), 'src/app/cars/cars-client.tsx'), 'utf8');

  it('gives the search control a lasting label rather than relying on placeholder', () => {
    expect(listing).toContain('htmlFor="vehicle-search"');
    expect(listing).toContain('id="vehicle-search"');
    expect(listing).toContain('Search vehicles by name or brand');
    expect(listing).toContain('type="search"');
  });

  it('announces the active category and offers touch-friendly controls', () => {
    expect(listing).toContain('aria-pressed={selectedCategory === category.id}');
    expect(listing).toContain('type="button"');
    expect(listing).toContain('min-h-11 px-5');
  });

  it('announces the updated result count without changing car search logic', () => {
    expect(listing).toContain('role="status" aria-live="polite"');
    expect(listing).toContain('Showing {filteredCars.length} of {allCars.length} vehicle profiles');
    expect(listing).toContain('setFilteredCars(result)');
  });
});
