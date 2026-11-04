'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Link from 'next/link';
import { MOK_BOOKING_URL } from '@/lib/bookingHandoff';

// Only publish policies that can be backed by the active booking flow.
// Pricing, age, insurance, deposit and delivery fees require Owner verification.
const faqs = [
  {
    question: 'Where do I book a rental car in Johor Bahru?',
    answer: 'Vehicle availability, rental dates and booking steps are handled in the MOK booking app. The website provides vehicle information and guidance about renting in Johor Bahru.',
  },
  {
    question: 'How can I check current rental prices and deposits?',
    answer: 'Open the MOK booking app to see available vehicle options and the current booking quotation. Review all displayed charges and terms before confirming.',
  },
  {
    question: 'Can I arrange a rental around Senai Airport?',
    answer: 'Please contact the MOK team to confirm whether an airport handover is available for your dates and whether a delivery charge applies. Do not assume airport pickup is included in every booking.',
  },
  {
    question: 'What documents will I need to rent a car?',
    answer: 'Prepare a valid driving licence and identification. The precise driver eligibility, supporting documents and verification requirements are confirmed during booking.',
  },
  {
    question: 'What car types can I choose?',
    answer: 'You can explore economy cars, family-oriented MPVs and larger vehicles on our website. The MOK booking app is the source of truth for currently available models.',
  },
  {
    question: 'Can a rental car be taken into Singapore?',
    answer: 'Do not assume a Johor Bahru rental may cross an international border. Contact MOK before booking to check the vehicle-specific policy and any required permissions.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className="py-20 bg-white" aria-labelledby="rental-faq-title">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D95706] mb-3">Plan with confidence</p>
          <h2 id="rental-faq-title" className="section-title">Car Rental FAQs in Johor Bahru</h2>
          <p className="text-gray-600 mb-10">Useful information before you continue to the MOK booking app.</p>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={faq.question} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <button
                  type="button"
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold text-[#17191B]">{faq.question}</span>
                  {openIndex === index ? <FiChevronUp aria-hidden="true" className="flex-shrink-0 text-[#E45E08]" /> : <FiChevronDown aria-hidden="true" className="flex-shrink-0 text-[#E45E08]" />}
                </button>
                {openIndex === index ? <p id={`faq-answer-${index}`} className="px-6 pb-5 text-gray-700 leading-relaxed">{faq.answer}</p> : null}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-9">
            <a className="btn-primary" href={MOK_BOOKING_URL}>Check live availability</a>
            <Link href="/contact" className="btn-secondary">Ask our team</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
