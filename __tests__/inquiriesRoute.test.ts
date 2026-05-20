const mockFrom = jest.fn();
const mockCreateClient = jest.fn(() => ({ from: mockFrom }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('/api/inquiries POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
  });

  test('returns 400 for invalid input', async () => {
    const { POST } = await import('@/app/api/inquiries/route');
    const req = new Request('http://localhost/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.1.1.1' },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  test('inserts inquiry and emits event', async () => {
    const { POST } = await import('@/app/api/inquiries/route');

    const inquirySingle = jest.fn(async () => ({ data: { id: '1' }, error: null }));
    const inquirySelect = jest.fn(() => ({ single: inquirySingle }));
    const inquiryInsert = jest.fn(() => ({ select: inquirySelect }));

    const eventSingle = jest.fn(async () => ({ data: { id: 'e1' }, error: null }));
    const eventSelect = jest.fn(() => ({ single: eventSingle }));
    const eventInsert = jest.fn(() => ({ select: eventSelect }));

    mockFrom.mockImplementation((table: string) => {
      if (table === 'inquiries') return { insert: inquiryInsert };
      if (table === 'inquiries_events') return { insert: eventInsert };
      return {};
    });

    const req = new Request('http://localhost/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '2.2.2.2' },
      body: JSON.stringify({
        carId: 'c1',
        carName: 'Toyota',
        customerName: 'Alice',
        whatsappNumber: '+6012',
        pickupDate: '2026-01-01',
        returnDate: '2026-01-02',
        pickupLocation: 'Office',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(inquiryInsert).toHaveBeenCalled();
    expect(eventInsert).toHaveBeenCalled();
  });
});

