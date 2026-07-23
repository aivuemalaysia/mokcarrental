import type { Metadata } from 'next';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';
import WhatsAppInquiryButton from '@/components/WhatsAppInquiryButton';

export const metadata: Metadata = {
  title: 'FAQ — Car Rental Questions Johor Bahru | MOK Car Rental',
  description: 'Frequently asked questions about car rental in Johor Bahru. Learn about booking, documents needed, driving in Malaysia, Singapore to JB tips, pickup/drop-off, and our rental terms.',
  keywords: [
    'car rental faq johor bahru',
    'rental car questions jb',
    'singapore to jb car rental faq',
    'driving license malaysia foreigner',
    'car rental requirements jb',
  ].join(', '),
  openGraph: {
    title: 'FAQ — MOK Car Rental Johor Bahru',
    description: 'Common questions about renting a car in Johor Bahru for Singapore travelers and tourists.',
    url: 'https://www.mokcarrental.com/faq',
    type: 'website',
    locale: 'en_MY',
  },
  alternates: {
    canonical: 'https://www.mokcarrental.com/faq',
  },
};

export default function FAQPage() {
  return (
    <div className="pt-20">
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Everything you need to know about renting a car with Mok Car Rental in Johor Bahru
          </p>
        </div>
      </section>

      <FAQ />

      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Still Have Questions?</h2>
            <p className="text-gray-600 mb-8">
              Can&apos;t find the answer you&apos;re looking for? Our team is available 24/7 via WhatsApp.
            </p>
            <WhatsAppInquiryButton
              label="Chat with Us on WhatsApp"
              className="btn-whatsapp inline-flex text-lg"
            />
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
