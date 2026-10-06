import type { NextRequest } from 'next/server';

// Mock the Supabase server client module.
jest.mock('@/lib/supabaseServer', () => ({
  getSupabaseServerClient: jest.fn(),
}));

// Mock rate limit module.
jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn(),
}));

import { GET } from '@/app/api/bookings/route';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { rateLimit } from '@/lib/rateLimit';

const mockedClient = getSupabaseServerClient as jest.Mock;
const mockedRateLimit = rateLimit as jest.Mock;

/**
 * Build a request the way Next delivers it to a route handler:
 * a Request with a fully-qualified URL, so `new URL(request.url)` works.
 */
function makeRequest(searchParams?: Record<string, string>): Request {
  const url = new URL('http://localhost/api/bookings');
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) url.searchParams.set(k, v);
  }
  return new Request(url.toString(), { method: 'GET' });
}

/** Mock the fluent Supabase chain used by the route. */
function mockChain(result: { data?: unknown; error?: unknown }) {
  const limitMock = jest.fn().mockResolvedValue(result);
  const orderMock = jest.fn().mockReturnValue({ limit: limitMock });
  const eqMock = jest.fn().mockReturnValue({ order: orderMock });
  const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
  const fromMock = jest.fn().mockReturnValue({ select: selectMock });
  mockedClient.mockReturnValue({ from: fromMock });
}

describe('GET /api/bookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRateLimit.mockResolvedValue({ ok: true });
    mockedClient.mockReturnValue({});
  });

  it('returns 400 when whatsapp param is missing', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate-limited', async () => {
    mockedRateLimit.mockResolvedValue({ ok: false });
    const res = await GET(makeRequest({ whatsapp: '+60123456789' }));
    expect(res.status).toBe(429);
  });

  it('returns 500 when client is misconfigured', async () => {
    mockedClient.mockImplementation(() => { throw new Error('no config'); });
    const res = await GET(makeRequest({ whatsapp: '+60123456789' }));
    expect(res.status).toBe(500);
  });

  it('returns bookings array on success', async () => {
    const rows = [
      {
        id: 'abc', car_id: '1', car_name: 'Toyota Vios',
        customer_name: 'Tan', whatsapp_number: '+60123456789',
        email: 'tan@example.com', pickup_date: '2026-10-01',
        return_date: '2026-10-05', pickup_location: 'Woodlands',
        status: 'confirmed', created_at: '2026-09-25T00:00:00Z',
      },
    ];
    mockChain({ data: rows, error: null });

    const res = await GET(makeRequest({ whatsapp: '+60123456789' }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.bookings).toHaveLength(1);
    expect(body.data.bookings[0].carName).toBe('Toyota Vios');
    expect(body.data.bookings[0].status).toBe('confirmed');
  });

  it('returns empty bookings array when no rows found', async () => {
    mockChain({ data: [], error: null });
    const res = await GET(makeRequest({ whatsapp: '+60999999999' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.bookings).toEqual([]);
  });

  it('returns 500 when Supabase query errors', async () => {
    mockChain({ data: null, error: { message: 'relation does not exist' } });
    const res = await GET(makeRequest({ whatsapp: '+60123456789' }));
    expect(res.status).toBe(500);
  });
});
