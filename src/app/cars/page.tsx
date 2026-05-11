'use client';

import { useState, useEffect } from 'react';
import CarCard from '@/components/CarCard';
import { supabase } from '@/lib/supabase';
import { Car } from '@/types';

const categories = [
  { id: 'all', label: 'All Cars' },
  { id: 'economy', label: 'Economy' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'mpv', label: 'MPV' },
  { id: 'suv', label: 'SUV' },
  { id: 'luxury', label: 'Luxury' },
];

export default function CarsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('available', true)
        .order('featured', { ascending: false })
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching cars:', error);
        return;
      }

      setAllCars(data || []);
      setFilteredCars(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredCars(allCars);
    } else {
      setFilteredCars(allCars.filter(car => car.category === category));
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚗</div>
          <p className="text-gray-600">Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Our Car Fleet
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Browse our premium selection of well-maintained rental vehicles
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gold-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

          {filteredCars.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No cars found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
