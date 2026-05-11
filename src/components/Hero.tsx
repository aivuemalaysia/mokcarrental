import Link from 'next/link';
import Image from 'next/image';
import { FiCheckCircle } from 'react-icons/fi';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&h=1080&fit=crop"
          alt="Luxury car"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      </div>

      <div className="relative z-10 container-custom text-center text-white pt-20">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="inline-block px-4 py-2 bg-gold-500/20 backdrop-blur-sm rounded-full border border-gold-500/50 mb-6">
            <span className="text-gold-400 font-medium">🚗 Johor Bahru's Premier Car Rental</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
            Premium Car Rental in{' '}
            <span className="text-gradient">Johor Bahru</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Affordable, reliable, and hassle-free rental cars for Singaporeans,
            tourists, and locals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/60123456789?text=Hello%20Mok%20Car%20Rental,%20I%20would%20like%20to%20inquire%20about%20car%20rental."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-lg px-8 py-4"
            >
              <span>Book via WhatsApp</span>
              <span>💬</span>
            </a>

            <Link href="/cars" className="btn-secondary text-lg px-8 py-4">
              Browse Cars
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400">500+</div>
              <div className="text-gray-400 text-sm mt-1">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400">15+</div>
              <div className="text-gray-400 text-sm mt-1">Quality Cars</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400">24/7</div>
              <div className="text-gray-400 text-sm mt-1">Support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400">5⭐</div>
              <div className="text-gray-400 text-sm mt-1">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
