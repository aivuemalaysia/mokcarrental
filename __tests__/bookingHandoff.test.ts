import { MOK_BOOKING_URL } from '@/lib/bookingHandoff';

describe('Marketing website booking handoff', () => {
  it('uses the official HTTPS MOK PWA fleet as the booking destination', () => {
    const destination = new URL(MOK_BOOKING_URL);
    expect(destination.protocol).toBe('https:');
    expect(destination.hostname).toBe('app.mokcarrental.com');
    expect(destination.pathname).toBe('/cars');
  });

  it('attributes website traffic without passing incompatible legacy vehicle IDs', () => {
    const destination = new URL(MOK_BOOKING_URL);
    expect(destination.searchParams.get('utm_source')).toBe('mokcarrental.com');
    expect(destination.searchParams.get('utm_medium')).toBe('website');
    expect(destination.searchParams.has('car')).toBe(false);
    expect(destination.searchParams.has('whatsapp')).toBe(false);
  });
});
