import { supabase } from '@/lib/supabase';

type Subscription = {
  unsubscribe: () => void;
};

/**
 * Subscribe to new bookings in real-time and call onChange when any
 * INSERT happens on the public.bookings table (i.e. a new booking was placed).
 */
export function subscribeToInquiries(onChange: () => void): Subscription {
  if (!supabase?.channel) return { unsubscribe: () => {} };

  const channel = supabase
    .channel('realtime:bookings')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'bookings' },
      () => {
        onChange();
      },
    )
    .subscribe();

  return {
    unsubscribe: () => {
      void channel.unsubscribe();
    },
  };
}
