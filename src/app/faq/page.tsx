import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';
import WhatsAppInquiryButton from '@/components/WhatsAppInquiryButton';

export const metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Mok Car Rental services, booking process, and rental terms.',
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
            Everything you need to know about renting a car with Mok Car Rental
          </p>
        </div>
      </section>

      <FAQ />

      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Still Have Questions?</h2>
            <p className="text-gray-600 mb-8">
              Can't find the answer you're looking for? Feel free to reach out to us directly.
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
