'use client';

import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import WhatsAppInquiryButton from '@/components/WhatsAppInquiryButton';

const faqs = [
  {
    question: 'Is a deposit required?',
    answer: 'Yes, a security deposit of RM200-500 is required depending on the car type. The deposit will be fully refunded upon successful return of the vehicle in good condition.',
  },
  {
    question: 'Are Singapore driving licenses accepted?',
    answer: 'Yes, Singapore driving licenses are accepted in Malaysia. You can rent and drive with your valid Singapore license. International driving permits are also accepted.',
  },
  {
    question: 'Do you offer airport delivery?',
    answer: 'Yes, we offer convenient pickup and drop-off at Senai International Airport (Johor Bahru). Airport delivery is available at an additional fee. Please contact us to arrange.',
  },
  {
    question: 'Is there a mileage limit?',
    answer: 'Our standard rental includes 200km per day. Additional distance is charged at RM0.30-0.50 per km depending on the vehicle. Unlimited mileage packages are available upon request.',
  },
  {
    question: 'What is your fuel policy?',
    answer: 'We operate on a full-to-full policy. You will receive the car with a full tank and are expected to return it with a full tank. If returned empty, refueling charges will apply.',
  },
  {
    question: 'What is the minimum rental age?',
    answer: 'The minimum rental age is 21 years old. Drivers must have held a valid driving license for at least 1 year. Additional young driver fees may apply for drivers under 25.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Everything you need to know about renting a car with us
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <FiChevronDown
                  className={`w-5 h-5 text-gold-500 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 bg-white">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <WhatsAppInquiryButton
            label="Chat with Us on WhatsApp"
            className="btn-whatsapp inline-flex"
          />
        </div>
      </div>
    </section>
  );
}
