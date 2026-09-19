'use client';

import { useState, useEffect, useCallback } from 'react';
import CarCard from '@/components/CarCard';

import { Car } from '@/types';
import Link from 'next/link';
import { FiSearch, FiFilter } from 'react-icons/fi';

const categories = [
  { id: 'all', label: 'All Cars' },
  { id: 'economy', label: 'Economy' },
  { id: 'sedan', label: 'Sedan' },
  { id: 'mpv', label: 'MPV' },
  { id: 'suv', label: 'SUV' },
  { id: 'luxury', label: 'Luxury' },
];

export default function CarsClient({ initialCars }: { initialCars: Car[] }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allCars, setAllCars] = useState<Car[]>(initialCars);
  const [filteredCars, setFilteredCars] = useState<Car[]>(initialCars);
  const [loading, setLoading] = useState(initialCars.length === 0);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch cars server-side first, then subscribe to real-time updates
  useEffect(() => {
    if (initialCars.length > 0) return; // already loaded
    fetchCars();
  }, [initialCars.length]);

  const fetchCars = async () => {
    try {
      const res = await fetch('/api/public/cars', { cache: 'no-store' });
      const json = await res.json().catch(() => null);
      const data: Car[] = Array.isArray(json?.data?.cars) ? json.data.cars : [];
      const error = json?.ok ? null : json?.error ? new Error(String(json.error)) : null;



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

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredCars(allCars);
    } else {
      setFilteredCars(allCars.filter(car => car.category === category));
    }
  }, [allCars]);

  // Filter by search query
  useEffect(() => {
    let result = allCars;
    if (selectedCategory !== 'all') {
      result = result.filter(car => car.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(car => 
        car.name.toLowerCase().includes(q) ||
        car.brand.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.description?.toLowerCase().includes(q)
      );
    }
    setFilteredCars(result);
  }, [allCars, selectedCategory, searchQuery]);

  return (
    <>
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="bg-gray-50 py-3">
        <div className="container-custom">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-gold-500">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">Our Fleet</li>
          </ol>
        </div>
      </nav>

      <section className="py-8 bg-white">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            Our Car Fleet — Rental Cars in Johor Bahru
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Browse our premium selection of well-maintained rental vehicles in Johor Bahru.
            From economy cars to luxury Alphard MPVs — perfect for Singapore travelers, airport transfers, and city exploration.
          </p>
        </div>
      </section>

      <section className="py-6 bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 text-sm ${
                    selectedCategory === category.id
                      ? 'bg-gold-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 w-64"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container-custom">
          <p className="text-sm text-gray-500 mb-6">
            Showing {filteredCars.length} of {allCars.length} available cars
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

          {filteredCars.length === 0 && !loading && (
            <div className="text-center py-16">
              <FiFilter className="w-12 h-12 text-gray-300 mx-auto mb-4" />

              <p className="text-gray-500 text-lg mb-4">No cars found in this category.</p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="text-gold-500 hover:text-gold-600 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}