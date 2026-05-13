import { NextResponse } from 'next/server';
import { jsonOk } from '@/lib/apiResponse';

export async function GET() {
  return jsonOk({
    status: 'ok',
    env: process.env.VERCEL_ENV ?? 'local',
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    time: new Date().toISOString(),
  });
}

export async function POST() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}

