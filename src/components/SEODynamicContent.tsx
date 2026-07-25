'use client';

import Link from 'next/link';

/**
 * SEO Content Block — Provides keyword-rich text content below the fold
 * on the homepage for Google to crawl and rank.
 * This is critical for a car rental business targeting "car rental Johor Bahru" keywords.
 */
export default function SEODynamicContent() {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom max-w-4xl">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">
          Affordable Car Rental in Johor Bahru — Mok Car Rental JB
        </h2>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            Looking for <strong>affordable car rental in Johor Bahru</strong>? Mok Car Rental offers
            a premium fleet of vehicles including Toyota Alphard, MPV rentals, economy sedans like the Perodua Bezza,
            and luxury cars for every budget. Whether you're a{' '}
            <strong>Singaporean crossing the Causeway</strong>, a tourist arriving at Senai International Airport,
            or a local resident needing a reliable ride, our self-drive and chauffeur-driven options are designed for you.
          </p>

          <p>
            Our <strong>car rental JB prices start from just RM150/day</strong> for economy sedans, making us
            one of the most competitive car rental services in Johor Bahru. Every vehicle comes with comprehensive
            insurance, free cancellation, and 24/7 WhatsApp support. We accept both MYR and SGD payments
            for your convenience.
          </p>

          <h3 className="text-xl font-bold mt-10 mb-4 text-gray-900">
            Why Choose Mok Car Rental for Your JB Car Hire?
          </h3>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong>No hidden fees</strong> — transparent pricing from RM150 to RM600/day</li>
            <li><strong>Free airport delivery</strong> at Senai International Airport (JHB)</li>
            <li><strong>Singapore driving license accepted</strong> — no IDP required for Singapore residents</li>
            <li><strong>Wide fleet</strong> — economy sedans, family MPVs, and luxury vehicles</li>
            <li><strong>Flexible pickup locations</strong> — airport, city center, border crossings</li>
            <li><strong>24/7 WhatsApp support</strong> — book in minutes via WhatsApp</li>
          </ul>

          <h3 className="text-xl font-bold mt-10 mb-4 text-gray-900">
            Popular Car Rental Services in Johor Bahru
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="border-l-4 border-gold-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Toyota Alphard Rental</h4>
              <p className="text-sm text-gray-600">
                The premium choice for families and groups. Luxury MPV from RM500/day with leather seats,
                captain chairs, and panoramic sunroof. Perfect for Singapore-to-JB trips and airport transfers.
              </p>
              <Link href="/cars" className="text-gold-600 hover:text-gold-700 text-sm font-medium">
                View Alphard Rentals →
              </Link>
            </div>

            <div className="border-l-4 border-gold-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Economy Car Rental JB</h4>
              <p className="text-sm text-gray-600">
                Budget-friendly sedans starting at RM150/day. Ideal for city driving, airport pickups,
                and solo travelers exploring Johor Bahru on a budget.
              </p>
              <Link href="/cars" className="text-gold-600 hover:text-gold-700 text-sm font-medium">
                Browse Economy Cars →
              </Link>
            </div>

            <div className="border-l-4 border-gold-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Senai Airport Car Delivery</h4>
              <p className="text-sm text-gray-600">
                Land at Senai Airport and drive away in your pre-booked rental car. We deliver directly
                to the terminal for hassle-free airport pick-up.
              </p>
              <Link href="/contact" className="text-gold-600 hover:text-gold-700 text-sm font-medium">
                Arrange Airport Pickup →
              </Link>
            </div>

            <div className="border-l-4 border-gold-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-1">Singapore to JB Car Rental</h4>
              <p className="text-sm text-gray-600">
                Cross the Causeway or Tuas Checkpoint and pick up your car near the border. No need
                to arrange transport from Singapore — we bring the car to you.
              </p>
              <Link href="/booking" className="text-gold-600 hover:text-gold-700 text-sm font-medium">
                Book Your Cross-Border Rental →
              </Link>
            </div>
          </div>

          <p className="mt-10">
            Ready to book?{' '}
            <Link href="/cars" className="text-gold-600 hover:text-gold-700 font-medium">
              Browse our full fleet
            </Link>{' '}
            or{' '}
            <Link href="/contact" className="text-gold-600 hover:text-gold-700 font-medium">
              contact us via WhatsApp
            </Link>{' '}
            for instant booking support. Serving Johor Bahru, Senai, Skudai, Masai, and the entire
            Johor region since 2020.
          </p>
        </div>
      </div>
    </section>
  );
}
