import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import type { Car } from '@/types';

// Public fleet endpoint.
//
// The Supabase RLS lockdown blocks anon-key reads of `cars`, so client-side
// JS (car listing, detail-page images, homepage featured cars) can no longer
// fetch the fleet directly from Supabase. This route reads with the
// service_role key server-side and returns only public, available cars.
// Read-only; safe to expose.
export const dynamic = 'force-dynamic';

type PublicCar = Omit<Car, 'description'> & { description?: string };

export async function GET() {
  try {
    const client = getSupabaseServerClient();
    const { data, error } = await client
      .from('cars')
      .select('*')
      .eq('available', true)
      .order('featured', { ascending: false })
      .order('price', { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Strip any admin-only columns before returning to the browser.
    const cars: PublicCar[] = (data || [])
      .map((car) => {
        const { ...publicCar } = car as Record<string, unknown>;
        delete publicCar.created_at;
        delete publicCar.updated_at;
        delete publicCar.owner_id;
        delete publicCar.status_history;
        // VIN, year and status are internal fleet data — never expose to browsers.
        delete publicCar.vin;
        delete publicCar.year;
        delete publicCar.status;
        return publicCar as PublicCar;
      });

    return NextResponse.json({ ok: true, data: { cars } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server misconfigured';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
