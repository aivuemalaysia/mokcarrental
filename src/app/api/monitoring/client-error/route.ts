import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const type = typeof body?.type === 'string' ? body.type.slice(0, 50) : 'unknown';
  const message = typeof body?.message === 'string' ? body.message.slice(0, 500) : '';
  const href = typeof body?.href === 'string' ? body.href.slice(0, 300) : '';

  console.error('CLIENT_ERROR', JSON.stringify({ type, message, href }));
  return NextResponse.json({ ok: true });
}
