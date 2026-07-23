import type { Metadata } from 'next';
import CarsClient from './cars-client';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Our Car Fleet — Rental Cars in Johor Bahru | Alphard, MPV, Sedan & Luxury',
  description: 'Browse our premium car rental fleet in Johor Bahru. Economy sedans, luxury vehicles, Alphard MPVs, and SUVs available for daily rental. Perfect for Singapore travelers and tourists. Prices from RM150/day.',
  keywords: [
    'car rental johor bahru fleet',
    'rental cars jb',
    'alphard rental jb',
    'mpv rental johor bahru',
    'luxury car rental jb',
    'car rental singapore to jb',
    'affordable car rental jb',
  ].join(', '),
  openGraph: {
    title: 'Our Car Fleet — MOK Car Rental JB',
    description: 'Browse our premium car rental fleet in Johor Bahru. From RM150/day.',
    url: 'https://www.mokcarrental.com/cars',
    type: 'website',
    locale: 'en_MY',
  },
  alternates: {
    canonical: 'https://www.mokcarrental.com/cars',
  },
};

async function fetchCars() {
  try {
    const { data } = await supabase
      .from('cars')
      .select('*')
      .eq('available', true)
      .order('featured', { ascending: false })
      .order('price', { ascending: true });
    return data || [];
  } catch {
    return [];
  }
}

export default async function CarsPage() {
  const initialCars = await fetchCars();
  return <CarsClient initialCars={initialCars} />;
}

