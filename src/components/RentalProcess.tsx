'use client';

import { FiSearch, FiMessageCircle, FiCheck, FiTruck } from 'react-icons/fi';
import { useWhatsAppInquiry } from '@/components/WhatsAppInquiryProvider';

const steps = [
  {
    number: 1,
    icon: FiSearch,
    title: 'Choose Your Car',
    description: 'Browse our fleet and select the perfect vehicle for your needs',
  },
  {
    number: 2,
    icon: FiMessageCircle,
    title: 'Contact via WhatsApp',
    description: 'Send us a message with your preferred dates and car choice',
  },
  {
    number: 3,
    icon: FiCheck,
    title: 'Confirm Booking',
    description: 'We\'ll confirm availability and provide all the details',
  },
  {
    number: 4,
    icon: FiTruck,
    title: 'Pickup & Drive',
    description: 'Collect your car and enjoy your journey',
  },
];

export default function RentalProcess() {
  const { openInquiry } = useWhatsAppInquiry();

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Renting a car has never been easier. Simple 4-step process
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gold-500/20 hidden lg:block -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-700 transition-colors duration-300 h-full">
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-gold-500 text-white flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                      {step.number}
                    </div>
                    <div className="text-center mb-4">
                      <step.icon className="w-12 h-12 text-gold-400 mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-center">{step.title}</h3>
                    <p className="text-gray-400 text-center">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            type="button"
            onClick={() => openInquiry()}
            className="btn-whatsapp text-lg px-8 py-4 inline-flex"
          >
            Start Your Booking
          </button>
        </div>
      </div>
    </section>
  );
}
