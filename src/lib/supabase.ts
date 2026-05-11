import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {} as SupabaseClient;

export const WHATSAPP_NUMBER = '+60123456789';

export function getWhatsAppLink(message?: string): string {
  const defaultMessage = `Hello Mok Car Rental, I would like to inquire about car rental.`;
  const encodedMessage = encodeURIComponent(message || defaultMessage);
  return `https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${encodedMessage}`;
}

export function getWhatsAppBookingLink(carName: string, pickupDate: string, returnDate: string): string {
  const message = `Hello Mok Car Rental,

I would like to inquire about car rental.

Car: ${carName}
Rental Date: ${pickupDate}
Return Date: ${returnDate}

Thank you!`;
  return getWhatsAppLink(message);
}
