import { createHmac } from 'crypto';

// We test the pure helpers in isolation so we do NOT need a live DB or the
// full Next request pipeline. The route's signature + event-filter logic is
// covered by these, plus a thin integration test that drives POST() with a
// mocked admin client.

jest.mock('@/lib/supabaseAdmin', () => ({
  getSupabaseAdminClient: jest.fn(),
}));

const mockAdmin: any = {
  from: jest.fn(),
};

function sign(rawBody: string, salt: string): string {
  return createHmac('sha256', salt).update(rawBody).digest('hex');
}

function makeRequest(rawBody: string, headers: Record<string, string>): Request {
  const h = new Headers(headers);
  const req = new Request('http://localhost/api/webhooks/hitpay', {
    method: 'POST',
    body: rawBody,
    headers: h,
  });
  return req;
}

const SALT = 'test-salt-123';
// Build a chainable mock whose terminal calls resolve to a no-data result,
// so both writeAuditLog(.insert) and attempt lookups(.select) are satisfied.
function chainMock() {
  const c: any = {
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [] }),
    insert: jest.fn().mockResolvedValue({ data: null }),
    update: jest.fn().mockResolvedValue({ data: null }),
    single: jest.fn().mockResolvedValue({ data: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null }),
  };
  return c;
}

describe('HitPay webhook POST /api/webhooks/hitpay', () => {
  let POST: any;
  let GET: any;

  beforeAll(async () => {
    process.env.HITPAY_WEBHOOK_SALT = SALT;
    const mod = await import('@/app/api/webhooks/hitpay/route');
    POST = mod.POST;
    GET = mod.GET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAdmin.from.mockReturnValue(chainMock());
    const supa = jest.requireMock('@/lib/supabaseAdmin');
    supa.getSupabaseAdminClient.mockReturnValue(mockAdmin);
  });

  test('GET is a public reachability probe (Deployment Protection path)', async () => {
    const res = await GET(new Request('http://x'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('rejects a bad signature with 401', async () => {
    const raw = JSON.stringify({ id: 'req-1' });
    const req = makeRequest(raw, {
      'hitpay-signature': sign(raw, 'wrong-salt'),
      'hitpay-event-object': 'charge',
      'hitpay-event-type': 'created',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('invalid_signature');
  });

  test('ignores non-handleable events (returns 200, no settlement)', async () => {
    const raw = JSON.stringify({ id: 'req-1' });
    const req = makeRequest(raw, {
      'hitpay-signature': sign(raw, SALT),
      'hitpay-event-object': 'transfer',
      'hitpay-event-type': 'created',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ignored).toBe('transfer.created');
  });

  test('rejects an unknown gateway attempt gracefully', async () => {
    const raw = JSON.stringify({ id: 'req-unknown' });
    // admin.from('gateway_attempts')...eq('hitpay_request_id', ...).limit() -> { data: [] }
    const chain = chainMock();
    chain.limit.mockResolvedValue({ data: [] });
    mockAdmin.from.mockReturnValue(chain);

    const settleMod = jest.requireMock('@/lib/hitpaySettle');
    settleMod.settleHitpayPayment.mockResolvedValue({ ok: true, outcome: 'settled' } as any);

    const req = makeRequest(raw, {
      'hitpay-signature': sign(raw, SALT),
      'hitpay-event-object': 'charge',
      'hitpay-event-type': 'created',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ignored).toBe('unknown_attempt');
  });

  test('settles a valid charge.created with matching provider data', async () => {
    const raw = JSON.stringify({ id: 'req-ok', payment_request_id: 'req-ok' });
    const bookingId = '11111111-1111-4111-8111-111111111111';

    const chain = chainMock();
    // insert().select('id').single() chain for the settle path
    chain.insert = jest.fn().mockReturnThis();
    chain.limit.mockResolvedValue({
      data: [{
        id: 'att-1',
        booking_id: bookingId,
        reference_number: `bk_${bookingId}`,
        amount: '50.00',
        currency: 'SGD',
        status: 'pending',
        env: 'sandbox',
      }],
    });
    mockAdmin.from.mockReturnValue(chain);

    const req = makeRequest(raw, {
      'hitpay-signature': sign(raw, SALT),
      'hitpay-event-object': 'charge',
      'hitpay-event-type': 'created',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.outcome).toBe('settled');
  });
});


// Mock for hitpaySettle so the integration test verifies the route's own logic
// without a live HitPay/DB.
jest.mock('@/lib/hitpaySettle', () => ({
  settleHitpayPayment: jest.fn(),
}));
