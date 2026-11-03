import Link from 'next/link';
import { MOK_BOOKING_URL } from '@/lib/bookingHandoff';

/**
 * Keep the existing /my-bookings URL for bookmarks and navigation, but do
 * not accept or render a phone number from the URL, browser storage or form.
 * Legacy records are available only in the authenticated website admin area.
 */
export default function MyBookingsPage() {
  return (
    <main className="pt-20 min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-14">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">My Bookings</h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            All new car rental bookings are handled securely in the MOK booking app.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom max-w-3xl">
          <div className="bg-white rounded-2xl p-8 shadow-xl mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Manage a MOK booking</h2>
            <p className="text-gray-600 mb-6">
              Use the MOK app to manage your booking. To rent another car,
              choose the dates and available vehicle in the app.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://app.mokcarrental.com" className="btn-primary text-center">
                Open MOK App
              </a>
              <a href={MOK_BOOKING_URL} className="btn-secondary text-center">
                Start a New Booking
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Looking for an older website inquiry?</h2>
            <p className="text-gray-600 mb-6">
              For customer privacy, our old phone-number-only lookup is no longer
              available. Please contact MOK support if you need help with an
              inquiry submitted on the previous website booking form.
            </p>
            <Link href="/contact" className="text-gold-600 font-semibold underline">
              Contact MOK Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
