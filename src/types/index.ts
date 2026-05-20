export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year?: number;
  vin?: string;
  status?: 'available' | 'unavailable' | 'maintenance';
  category: 'economy' | 'sedan' | 'suv' | 'mpv' | 'luxury';
  price: number;
  seats: number;
  transmission: 'automatic' | 'manual';
  fuel_type: 'petrol' | 'diesel' | 'hybrid';
  image: string;
  images?: string[];
  features?: string[];
  description?: string;
  available: boolean;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Inquiry {
  id?: string;
  car_id?: string;
  car_name?: string;
  carId: string;
  carName: string;
  customer_name?: string;
  customerName: string;
  whatsapp_number?: string;
  whatsappNumber: string;
  email?: string;
  pickup_date?: string;
  return_date?: string;
  pickupDate: string;
  returnDate: string;
  pickup_location?: string;
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
