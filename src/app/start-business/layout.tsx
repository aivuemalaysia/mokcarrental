import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner With MOK Car Rental in Johor Bahru',
  description: 'Submit your car details and photos to partner with Mok Car Rental in Johor Bahru. We handle listings and bookings for you.',
  alternates: { canonical: '/start-business' },
};

export default function StartBusinessLayout({ children }: { children: React.ReactNode }) {
  return children;
}