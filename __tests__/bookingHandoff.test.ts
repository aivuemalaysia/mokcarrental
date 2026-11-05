import { MOK_BOOKING_URL, bookingUrlForPath } from '@/lib/bookingHandoff';

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
    expect(destination.searchParams.get('utm_campaign')).toBe('booking_handoff');
    expect(destination.searchParams.get('utm_content')).toBe('/');
    expect(destination.searchParams.has('car')).toBe(false);
    expect(destination.searchParams.has('whatsapp')).toBe(false);
  });
  it('attributes public source paths without changing the destination or existing tags', () => {
    for (const source of ['/', '/cars', '/senai-airport-car-rental', '/toyota-alphard-rental-jb', '/cars/11b5e382-59b9-42f1-825c-566369103882']) {
      const url = new URL(bookingUrlForPath(source));
      expect(url.origin + url.pathname).toBe('https://app.mokcarrental.com/cars');
      expect(url.searchParams.get('utm_source')).toBe('mokcarrental.com');
      expect(url.searchParams.get('utm_medium')).toBe('website');
      expect(url.searchParams.get('utm_campaign')).toBe('booking_handoff');
      expect(url.searchParams.get('utm_content')).toBe(source);
    }
  });

  it('does not leak query parameters, fragments or private routes into utm_content', () => {
    expect(new URL(bookingUrlForPath('/cars?email=private%40example.com')).searchParams.get('utm_content')).toBe('/cars');
    expect(new URL(bookingUrlForPath('/contact#phone')).searchParams.get('utm_content')).toBe('/contact');
    expect(new URL(bookingUrlForPath('/admin/dashboard')).searchParams.get('utm_content')).toBe('/');
    expect(new URL(bookingUrlForPath('//evil.example/redirect')).searchParams.get('utm_content')).toBe('/');
  });
});
