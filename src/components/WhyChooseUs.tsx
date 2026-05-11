import { FiDollarSign, FiSmile, FiTruck, FiHeadphones, FiAward, FiCheckCircle } from 'react-icons/fi';

const features = [
  {
    icon: FiDollarSign,
    title: 'Affordable Pricing',
    description: 'Competitive rates without hidden charges. Best value for your money.',
  },
  {
    icon: FiSmile,
    title: 'Clean & Sanitized',
    description: 'All cars thoroughly cleaned and sanitized before every rental.',
  },
  {
    icon: FiTruck,
    title: 'Airport Delivery',
    description: 'Convenient pickup and drop-off at Senai Airport.',
  },
  {
    icon: FiHeadphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support via WhatsApp.',
  },
  {
    icon: FiAward,
    title: 'Trusted by Singaporeans',
    description: 'Hundreds of satisfied customers from Singapore.',
  },
  {
    icon: FiCheckCircle,
    title: 'Easy Booking',
    description: 'Simple WhatsApp booking process. No complicated forms.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Why Choose Mok Car Rental?</h2>
          <p className="section-subtitle">
            Experience the difference with our premium car rental service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-2xl bg-gray-50 hover:bg-gold-50 transition-colors duration-300 group">
              <div className="w-16 h-16 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4 group-hover:bg-gold-500 transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-gold-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
