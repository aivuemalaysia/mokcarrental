'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import WhatsAppInquiryButton from '@/components/WhatsAppInquiryButton';

const faqs = [
  {
    question: 'How much does it cost to rent a car in Johor Bahru?',
    answer:
      'Car rental in Johor Bahru starts from RM150/day for economy sedans (Perodua Bezza, Honda City) up to RM600+/day for premium MPVs like the Toyota Alphard. We offer competitive rates with no hidden charges — prices include insurance and basic breakdown coverage.',
  },
  {
    question: 'Do Singapore drivers need an international driving permit in Malaysia?',
    answer:
      'No. A valid Singapore driving license is fully accepted in Malaysia. You can legally drive your rented car with your Singapore license. International Driving Permits (IDP) are also welcome. Minimum age requirement is 21 years old.',
  },
  {
    question: 'Can I pick up my rental car at Senai Airport or the Malaysia-Singapore Causeway?',
    answer:
      'Yes! We offer airport delivery at Senai International Airport (JHB) and can arrange pickup near the Causeway (Woodlands/Tuas checkpoints). Airport delivery incurs a small additional fee. Contact us via WhatsApp to arrange convenient pickup.',
  },
  {
    question: 'What documents do I need to rent a car in Johor Bahru?',
    answer:
      'You need: a valid driving license (Singapore or international), passport or IC for identification, and a security deposit of RM200-500 depending on vehicle category. The deposit is fully refundable upon safe return of the vehicle.',
  },
  {
    question: 'Is there a mileage limit on rentals? What is the fuel policy?',
    answer:
      'Standard rental includes 200km per day. Additional distance is charged at RM0.30/km. Our fuel policy is full-to-full — you receive the car with a full tank and return it the same way. Unlimited mileage packages available for long-term rentals.',
  },
  {
    question: 'Do you offer long-term car rental and corporate rental packages in JB?',
    answer:
      'Yes, we offer flexible weekly and monthly rental packages at discounted rates. Perfect for business travelers between Singapore and Johor Bahru. Contact us for custom corporate rates and fleet arrangements for your company.',
  },
  {
    question: 'What car types are available for rent in Johor Bahru?',
    answer:
      'We offer economy sedans (Perodua Bezza, Honda City), MPVs (Toyota Alphard, Honda Odyssey, Toyota Vellfire), SUVs, and luxury vehicles. All cars are well-maintained, fully air-conditioned, sanitized before each rental, and come with comprehensive insurance.',
  },
  {
    question: 'Can I drive from Johor Bahru back to Singapore with the rental car?',
    answer:
      'Please note that our standard rentals are for use within Malaysia. For cross-border travel between JB and Singapore, please contact us in advance to arrange permissions and any additional documentation required.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (index: number) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">
            Frequently Asked Questions — Car Rental in Johor Bahru
          </h2>
          <p className="section-subtitle text-lg text-gray-500 max-w-2xl mx-auto">
            Everything you need to know about renting a car in JB. Can&apos;t find what you&apos;re
            looking for? Chat with us on WhatsApp.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-xl overflow-hidden transition-colors ${
                openIndex === index
                  ? 'border-gold-500 bg-gold-50/50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between bg-transparent"
                onClick={() => toggle(index)}
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-gray-900 pr-4 text-base">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <FiChevronUp className="w-5 h-5 text-gold-500 flex-shrink-0" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gold-500 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4 text-lg">Still have questions about car rental in JB?</p>
          <WhatsAppInquiryButton
            label="Chat with Us on WhatsApp"
            className="btn-whatsapp inline-flex text-lg px-8 py-3"
          />
        </div>
      </div>
    </section>
  );
}
