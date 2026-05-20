const mockFrom = jest.fn();
const mockCreateClient = jest.fn(() => ({ from: mockFrom }));

jest.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('/api/content/why-choose', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
  });

  test('GET returns ok:true with null data when table is missing', async () => {
    const { GET } = await import('@/app/api/content/why-choose/route');

    const maybeSingleMock = jest.fn(async () => ({
      data: null,
      error: { message: "Could not find the table 'public.content_sections' in the schema cache" },
    }));
    const isMock = jest.fn(() => ({ maybeSingle: maybeSingleMock }));
    const eqMock = jest.fn(() => ({ is: isMock }));
    const selectMock = jest.fn(() => ({ eq: eqMock }));

    mockFrom.mockImplementation(() => ({ select: selectMock }));

    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data).toBeNull();
  });
});

