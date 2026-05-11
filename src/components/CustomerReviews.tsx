import { FaStar } from 'react-icons/fa';

const reviews = [
  {
    name: 'David Tan',
    location: 'Singapore',
    rating: 5,
    text: 'Excellent service! Booked an Alphard for a family trip to JB. Car was clean and the pickup was smooth. Will definitely use again!',
    car: 'Toyota Alphard',
  },
  {
    name: 'Sarah Lee',
    location: 'Kuala Lumpur',
    rating: 5,
    text: 'Super convenient for tourists like me. The WhatsApp booking made everything so easy. Great prices too!',
    car: 'Honda City',
  },
  {
    name: 'Ahmad Razak',
    location: 'Johor Bahru',
    rating: 5,
    text: 'Best car rental experience in JB. Professional service and well-maintained vehicles. Highly recommended!',
    car: 'Perodua Alza',
  },
];

export default function CustomerReviews() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">
            Don't just take our word for it
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <FaStar key={i} className="w-5 h-5 text-gold-500 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 italic">"{review.text}"</p>
              
              <div className="border-t pt-4">
                <div className="font-bold text-gray-900">{review.name}</div>
                <div className="text-sm text-gray-500">{review.location}</div>
                <div className="text-sm text-gold-500 mt-1">Rented: {review.car}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
