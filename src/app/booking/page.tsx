import Link from 'next/link';
import { MOK_BOOKING_URL } from '@/lib/bookingHandoff';

// Keep the existing website URL and canonical so existing SEO links stay valid.
// Booking forms and availability are now handled exclusively by MOK PWA.
export const metadata = {
  title: 'Book a Car — Reserve Online',
  description: 'Book your rental car in Johor Bahru. Choose dates, select your vehicle, and confirm your reservation with Mok Car Rental.',
  alternates: { canonical: '/booking' },
};

export default function BookingPage() {
  return (
    <main className="pt-20 min-h-screen bg-gray-50">
      <section className="py-16 md:py-24">
        <div className="container-custom max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            Book Your Rental Car
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Continue to the MOK booking app to select available cars, choose
            your pickup and return dates, and complete your booking.
          </p>
          <a href={MOK_BOOKING_URL} className="btn-primary inline-flex px-8 py-4 text-lg">
            Continue to MOK Booking
          </a>
          <p className="mt-7 text-sm text-gray-600">
            Want to explore car details first?{' '}
            <Link href="/cars" className="underline text-gold-600">Browse our fleet</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
