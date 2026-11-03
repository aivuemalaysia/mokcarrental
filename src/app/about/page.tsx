import type { Metadata } from 'next';
import { FiCheckCircle, FiSmile, FiTruck, FiHeadphones } from 'react-icons/fi';
import CTASection from '@/components/CTASection';

export const metadata: Metadata = {
  title: 'About MOK Car Rental in Johor Bahru',
  description: 'Learn about MOK Car Rental in Johor Bahru. Explore vehicle types, rental guidance and how to check live options in our online booking app.',
  keywords: [
    'about mok car rental',
    'car rental company johor bahru',
    'trusted car rental jb',
    'car rental singapore johor bahru',
  ].join(', '),
  openGraph: {
    title: 'About MOK Car Rental in Johor Bahru',
    description: 'Information about MOK Car Rental, rental options in JB and our online booking process.',
    url: 'https://www.mokcarrental.com/about',
    type: 'website',
    locale: 'en_MY',
  },
  alternates: {
    canonical: 'https://www.mokcarrental.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="pt-20">
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            About MOK Car Rental — Your JB Car Rental Partner
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Information about MOK Car Rental, vehicle options, booking and travel in Johor Bahru.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  MOK Car Rental was founded with a simple mission: to provide affordable, reliable, and hassle-free car rental services in Johor Bahru, Malaysia.
                </p>
                <p>
                  Our website helps visitors explore car rental options in JB, and the MOK booking app handles live vehicle availability and reservations.
                </p>
                <p>
                  Whether you are travelling from Singapore, visiting Johor Bahru for shopping or business, or exploring Johor, your travel dates, passenger count and luggage determine which vehicle types to compare. Check available options in the MOK booking app.
                </p>
                <p>
                  We take pride in our well-maintained fleet of vehicles, professional service, and commitment to customer satisfaction. Our goal is to make every rental experience smooth and enjoyable.
                </p>
                <p>
                  Whether you need a compact car for city driving, a spacious MPV for family trips, or a luxury vehicle for special occasions, we have the perfect car for you. Many of our regular customers are Singaporeans who rent from us for weekend trips to JB, business visits, or cross-border travel.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Why Choose Us?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiCheckCircle className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Professional Service</h4>
                    <p className="text-gray-600 text-sm">
                      Experienced team dedicated to providing top-notch car rental service in Johor Bahru.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiSmile className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Well-Maintained Vehicles</h4>
                    <p className="text-gray-600 text-sm">
                      Ask our team about the condition and preparation of the vehicle offered for your booking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiTruck className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Pickup &amp; Return Arrangements</h4>
                    <p className="text-gray-600 text-sm">
                      Ask our team about available pickup and return arrangements in Johor Bahru.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiHeadphones className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Customer Support</h4>
                    <p className="text-gray-600 text-sm">
                      Contact our team for assistance with rental questions and bookings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">Reliability</h3>
              <p className="text-gray-600">
                Count on us for dependable vehicles and dependable service, every single time. Our cars are always ready and professionally maintained.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3">Affordability</h3>
              <p className="text-gray-600">
                Review the current booking quotation, deposit and applicable fees in MOK PWA before confirming a rental.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-5xl mb-4">😊</div>
              <h3 className="text-xl font-bold mb-3">Customer First</h3>
              <p className="text-gray-600">
                Contact our team with questions about vehicle selection, rental requirements and arrangements.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
