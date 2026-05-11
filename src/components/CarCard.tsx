import Link from 'next/link';
import Image from 'next/image';
import { Car } from '@/types';
import { FiUsers, FiSettings, FiZap } from 'react-icons/fi';
import { getWhatsAppBookingLink } from '@/lib/supabase';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const whatsappLink = getWhatsAppBookingLink(car.name, '', '');

  return (
    <div className="card group">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={car.image}
          alt={car.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          RM{car.price}/day
        </div>
        {!car.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{car.name}</h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <FiUsers className="w-4 h-4" />
            <span>{car.seats} Seats</span>
          </div>
          <div className="flex items-center gap-1">
            <FiSettings className="w-4 h-4" />
            <span className="capitalize">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiZap className="w-4 h-4" />
            <span className="capitalize">{car.fuel_type}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/cars/${car.id}`}
            className="flex-1 btn-secondary text-center text-sm"
          >
            View Details
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn-whatsapp text-center text-sm"
          >
            Book
          </a>
        </div>
      </div>
    </div>
  );
}
