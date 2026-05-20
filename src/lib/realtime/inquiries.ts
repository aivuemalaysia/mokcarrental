import { supabase } from '@/lib/supabase';

type Subscription = {
  unsubscribe: () => void;
};

export function subscribeToInquiries(onChange: () => void): Subscription {
  if (!supabase?.channel) return { unsubscribe: () => {} };

  const channel = supabase
    .channel('realtime:inquiries_events')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'inquiries_events' },
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
