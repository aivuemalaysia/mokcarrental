import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — Get In Touch | Mok Car Rental JB',
  description: 'Contact Mok Car Rental in Johor Bahru. Book via WhatsApp, phone, or email. Located near Singapore border.',
  alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}