import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-gold-500 to-gold-600 text-white">
      <div className="container-custom text-center">
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
          Ready To Drive?
        </h2>
        <p className="text-xl text-gold-100 mb-8 max-w-2xl mx-auto">
          Book your perfect rental car today and explore Johor Bahru in comfort and style
        </p>
        <a
          href="https://wa.me/60123456789?text=Hello%20Mok%20Car%20Rental,%20I%20would%20like%20to%20inquire%20about%20car%20rental."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-gold-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center gap-2"
        >
          <span>Book Now on WhatsApp</span>
          <span>💬</span>
        </a>
      </div>
    </section>
  );
}
