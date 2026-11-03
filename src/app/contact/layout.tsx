import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact MOK Car Rental in Johor Bahru',
  description: 'Contact MOK Car Rental about Johor Bahru rental enquiries, vehicle questions and pickup arrangements. Check live availability and book through MOK PWA.',
  alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}