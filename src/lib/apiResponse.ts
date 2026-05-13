import { NextResponse } from 'next/server';

export function jsonOk(data?: any, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data: data ?? null }, init);
}

export function jsonError(error: string, status = 500, init?: ResponseInit) {
  return NextResponse.json({ ok: false, error }, { status, ...init });
}
