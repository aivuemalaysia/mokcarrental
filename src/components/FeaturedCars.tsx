'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CarCard from './CarCard';
import { supabase } from '@/lib/supabase';
import { Car } from '@/types';

export default function FeaturedCars() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('featured', true)
        .eq('available', true)
        .limit(6)
        .order('updated_at', { ascending: false })
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching featured cars:', error);
        return;
      }

      setFeaturedCars(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Featured Rental Cars</h2>
            <p className="section-subtitle">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Featured Rental Cars</h2>
          <p className="section-subtitle">
            Choose from our premium selection of well-maintained vehicles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/cars" className="btn-primary">
            View All Cars
          </Link>
        </div>
      </div>
    </section>
  );
}
