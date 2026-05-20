import { NextResponse } from 'next/server';
import { handleExecutionRequest } from '@/lib/execution/middleware';

export async function POST(request: Request) {
  const { status, body } = await handleExecutionRequest(request);
  return NextResponse.json(body, { status });
}

