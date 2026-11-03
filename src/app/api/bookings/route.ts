import { NextResponse } from 'next/server';

/**
 * The legacy WhatsApp-number-only inquiry lookup has been retired.
 * Knowing a phone number is not proof of ownership; never query or return
 * historical customer details from this unauthenticated public endpoint.
 *
 * Historical inquiries remain available through /api/admin/inquiries,
 * which requires a verified admin session. No records are deleted.
 */
export function GET(_request: Request) {
  return NextResponse.json(
    {
      ok: false,
      error: 'Public booking lookup is no longer available. Contact MOK support about earlier website inquiries.',
    },
    {
      status: 410,
      headers: {
        'Cache-Control': 'private, no-store',
        Pragma: 'no-cache',
      },
    },
  );
}

export function POST() {
  return NextResponse.json(
    { ok: false, error: 'Method not allowed' },
    { status: 405, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
