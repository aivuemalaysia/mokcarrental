import { FiCheckCircle, FiSmile, FiTruck, FiHeadphones } from 'react-icons/fi';
import CTASection from '@/components/CTASection';

export const metadata = {
  title: 'About Us',
  description: 'Learn about Mok Car Rental - Your trusted partner for premium car rentals in Johor Bahru, Malaysia.',
};

export default function AboutPage() {
  return (
    <div className="pt-20">
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            About Mok Car Rental
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Your trusted partner for premium car rentals in Johor Bahru
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
                  Mok Car Rental was founded with a simple mission: to provide affordable,
                  reliable, and hassle-free car rental services in Johor Bahru, Malaysia.
                </p>
                <p>
                  Starting as a small family business, we have grown to become one of the most
                  trusted car rental companies in JB, serving thousands of customers from
                  Singapore, tourists, and local Malaysians.
                </p>
                <p>
                  We take pride in our well-maintained fleet of vehicles, professional service,
                  and commitment to customer satisfaction. Our goal is to make every rental
                  experience smooth and enjoyable.
                </p>
                <p>
                  Whether you need a compact car for city driving, a spacious MPV for family
                  trips, or a luxury vehicle for special occasions, we have the perfect car
                  for you.
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
                      Experienced team dedicated to providing top-notch service
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
                      All cars regularly serviced and thoroughly cleaned
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiTruck className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Airport Delivery</h4>
                    <p className="text-gray-600 text-sm">
                      Convenient pickup and drop-off at Senai Airport
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiHeadphones className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">24/7 Support</h4>
                    <p className="text-gray-600 text-sm">
                      Round-the-clock assistance via WhatsApp
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
                Count on us for dependable vehicles and dependable service, every time.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3">Affordability</h3>
              <p className="text-gray-600">
                Premium cars at competitive prices with no hidden charges.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-5xl mb-4">😊</div>
              <h3 className="text-xl font-bold mb-3">Customer First</h3>
              <p className="text-gray-600">
                Your satisfaction is our top priority. We're here to help 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
