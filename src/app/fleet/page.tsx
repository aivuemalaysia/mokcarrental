import { redirect } from 'next/navigation';

// SEO alias - redirects to /cars with canonical link
export default function FleetPage() {
  redirect('/cars');
}

// Add metadata for SEO
export const metadata = {
  title: 'Our Fleet | Mok Car Rental',
  robots: {
    index: false,
    follow: true,
  },
};
