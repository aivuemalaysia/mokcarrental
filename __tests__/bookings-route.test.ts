import { GET, POST } from '@/app/api/bookings/route';

describe('legacy public /api/bookings', () => {
  it.each([
    ['without a phone number', 'http://localhost/api/bookings'],
    ['with a phone number', 'http://localhost/api/bookings?whatsapp=%2B60123456789'],
    ['with a different phone number', 'http://localhost/api/bookings?whatsapp=%2B60987654321'],
    ['with a legacy inquiry identifier', 'http://localhost/api/bookings?whatsapp=%2B60123456789&rebook=old-id'],
  ])('does not expose historical customer data %s', async (_label, _url) => {
    const response = await GET();
    expect(response.status).toBe(410);
    expect(response.headers.get('Cache-Control')).toContain('no-store');

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body).not.toHaveProperty('data');
    expect(body).not.toHaveProperty('bookings');
    expect(JSON.stringify(body)).not.toMatch(/whatsapp_number|customer_name|pickup_location|car_id|email/i);
  });

  it('rejects legacy public POST submissions', async () => {
    const response = POST();
    expect(response.status).toBe(405);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body).not.toHaveProperty('data');
  });
});
