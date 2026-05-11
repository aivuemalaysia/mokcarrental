'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, getWhatsAppBookingLink } from '@/lib/supabase';
import { Inquiry, Car } from '@/types';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const carId = searchParams.get('car');
  
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<Partial<Inquiry>>({
    carId: carId || '',
    carName: '',
    customerName: '',
    whatsappNumber: '',
    email: '',
    pickupDate: '',
    returnDate: '',
    pickupLocation: 'Mok Car Rental Office',
    notes: '',
    status: 'pending',
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (carId && cars.length > 0) {
      const car = cars.find(c => c.id === carId);
      if (car) {
        setSelectedCar(car);
        setFormData(prev => ({ ...prev, carId: car.id, carName: car.name }));
      }
    }
  }, [carId, cars]);

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('available', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching cars:', error);
        return;
      }

      setCars(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('inquiries').insert([formData]);
      
      if (error) {
        console.error('Error submitting inquiry:', error);
        alert('Failed to submit inquiry. Please try again.');
        return;
      }

      setSubmitted(true);
      
      const whatsappUrl = getWhatsAppBookingLink(
        formData.carName || '',
        formData.pickupDate || '',
        formData.returnDate || ''
      );

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCarSelect = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (car) {
      setSelectedCar(car);
      setFormData(prev => ({ ...prev, carId, carName: car.name }));
    }
  };

  if (submitted) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container-custom">
          <div className="max-w-xl mx-auto text-center bg-white rounded-2xl p-12 shadow-xl">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold mb-4">Booking Inquiry Submitted!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your inquiry. We've received your booking request and will 
              contact you shortly via WhatsApp.
            </p>
            <a
              href="https://wa.me/60123456789?text=Hello%20Mok%20Car%20Rental,%20I%20just%20submitted%20a%20booking%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-lg"
            >
              Continue on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Book Your Car
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Fill out the form below and we'll get back to you shortly
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Select Your Car</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cars.map((car) => (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => handleCarSelect(car.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.carId === car.id
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-gray-200 hover:border-gold-300'
                      }`}
                    >
                      <div className="text-sm font-bold">{car.name}</div>
                      <div className="text-xs text-gray-500">RM{car.price}/day</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Your Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="input-field"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="+60 12-345 6789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>

                <h2 className="text-2xl font-bold pt-6">Rental Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="input-field"
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="input-field"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Location *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.pickupLocation}
                    onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  >
                    <option value="Mok Car Rental Office">Mok Car Rental Office - Taman Molek</option>
                    <option value="Senai Airport">Senai Airport (Arrival Hall)</option>
                    <option value="CIQ Johor Bahru">CIQ Johor Bahru</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    rows={4}
                    className="input-field resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special requirements or questions?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !formData.carId}
                  className="btn-whatsapp w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Inquiry & Book on WhatsApp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
