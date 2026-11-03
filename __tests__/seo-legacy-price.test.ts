import fs from 'node:fs';
import path from 'node:path';

describe('Marketing site does not publish unverified legacy rental prices', () => {
  const detail = fs.readFileSync(path.join(process.cwd(), 'src/app/cars/[id]/page.tsx'), 'utf8');
  const card = fs.readFileSync(path.join(process.cwd(), 'src/components/CarCard.tsx'), 'utf8');

  it('keeps car-detail pages indexable but does not advertise legacy price as booking quotation', () => {
    expect(detail).toContain('Check live rental rates');
    expect(detail).toContain('canonical:');
    expect(detail).not.toContain('from RM${price}/day');
    expect(detail).not.toContain("    offers: {");
    expect(detail).not.toContain('Daily mileage allowance: 200km');
  });

  it('uses vehicle information rather than a legacy pricing badge', () => {
    expect(card).toContain('Vehicle information');
    expect(card).not.toContain('RM{car.price}/day');
  });
});
