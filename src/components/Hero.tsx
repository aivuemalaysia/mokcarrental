'use client';

import Link from 'next/link';
import { useWhatsAppInquiry } from '@/components/WhatsAppInquiryProvider';

export default function Hero() {
  const { openInquiry } = useWhatsAppInquiry();

  return (
    <section
      className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden"
      aria-label="Car rental in Johor Bahru hero section"
    >
      {/* Background image - using direct img tag since next.config has unoptimized:true */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&h=1080&fit=crop&q=80"
          alt="Affordable car rental in Johor Bahru - Toyota Alphard and luxury fleet parked near city skyline"
          className="object-cover w-full h-full object-center"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
      </div>

      <div className="relative z-10 container-custom text-center text-white pt-20">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Keyword-rich eyebrow */}
          <div className="inline-block px-4 py-2 bg-gold-500/20 backdrop-blur-sm rounded-full border border-gold-500/50 mb-6">
            <span className="text-gold-400 font-medium">
              Trusted by 500+ Customers Since 2020
            </span>
          </div>

          {/* Primary H1 — exact match for "car rental johor bahru" and "affordable car rental jb" */}
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
            Affordable <span className="text-gradient">Car Rental</span> in{' '}
            <span className="text-gradient">Johor Bahru</span>
          </h1>

          {/* Supporting description — includes target keywords naturally */}
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Premium Toyota Alphard, MPV, sedan &amp; luxury car rental in Johor Bahru from RM150/day.
            Serving Singapore customers crossing the Causeway, tourists at Senai Airport, and locals.
          </p>

          {/* Dual CTA — WhatsApp for conversion, Browse for discovery */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              type="button"
              onClick={() => openInquiry()}
              className="btn-whatsapp text-lg px-8 py-4"
            >
              <span>Book via WhatsApp</span>
              <span>&#128172;</span>
            </button>

            <Link href="/cars" className="btn-secondary text-lg px-8 py-4">
              Browse Our Fleet
            </Link>
          </div>

          {/* Trust signals */}
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
              <div className="text-gray-400 text-sm mt-1">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gold-400">4.9&#9733;</div>
              <div className="text-gray-400 text-sm mt-1">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Organic gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
