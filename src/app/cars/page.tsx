import type { Metadata } from 'next';
import CarsClient from './cars-client';
import { MOK_SOCIAL_IMAGE } from '@/lib/seo';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

const baseUrl = 'https://www.mokcarrental.com';

export const metadata: Metadata = {
  title: 'Car Rental Vehicle Options in Johor Bahru',
  description: 'Explore vehicle information for Johor Bahru rental, including economy cars, family MPVs and premium options. Check live cars, pricing and booking terms in MOK PWA.',
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
    title: 'Car Rental Vehicle Options in Johor Bahru | MOK',
    description: 'Browse vehicle information in Johor Bahru and check live availability in MOK PWA.',
    url: `${baseUrl}/cars`,
    type: 'website',
    locale: 'en_MY',
    images: [MOK_SOCIAL_IMAGE],
  },
  alternates: {
    canonical: `${baseUrl}/cars`,
  },
};

async function fetchCars() {
  try {
    const client = getSupabaseServerClient(); const { data } = await client
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
