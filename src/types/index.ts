export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: 'economy' | 'sedan' | 'suv' | 'mpv' | 'luxury';
  price: number;
  seats: number;
  transmission: 'automatic' | 'manual';
  fuel_type: 'petrol' | 'diesel' | 'hybrid';
  image: string;
  images?: string[];
  features: string[];
  description: string;
  available: boolean;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Inquiry {
  id?: string;
  carId: string;
  carName: string;
  customerName: string;
  whatsappNumber: string;
  email?: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}
