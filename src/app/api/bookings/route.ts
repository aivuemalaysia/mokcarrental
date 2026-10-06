import { NextResponse } from 'next/server';
import { jsonError, jsonOk } from '@/lib/apiResponse';
import { rateLimit } from '@/lib/rateLimit';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const whatsapp = url.searchParams.get('whatsapp')?.trim();
  if (!whatsapp) return jsonError('whatsapp is required', 400);

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const limited = await rateLimit({ key: `bookings:${ip}`, limit: 20, windowMs: 60_000 });
  if (!limited.ok) return jsonError('Too many requests', 429);

  let client;
  try {
    client = getSupabaseServerClient();
  } catch {
    return jsonError('Server misconfigured', 500);
  }

  const { data, error } = await client
    .from('inquiries')
    .select(
      'id, car_id, car_name, customer_name, whatsapp_number, email, pickup_date, return_date, pickup_location, status, created_at'
    )
    .eq('whatsapp_number', whatsapp)
    .order('created_at', { ascending: false })
    .limit(25);

  if (error) return jsonError(error.message, 500);

  const bookings = (data || []).map((row: any) => ({
    id: row.id,
    carId: row.car_id ?? '',
    carName: row.car_name ?? '',
    customerName: row.customer_name ?? '',
    whatsapp: row.whatsapp_number ?? '',
    email: row.email ?? '',
    pickupDate: row.pickup_date ?? '',
    returnDate: row.return_date ?? '',
    pickupLocation: row.pickup_location ?? '',
    status: row.status ?? 'pending',
    createdAt: row.created_at ?? '',
  }));

  return jsonOk({ bookings });
}

export function POST() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}
