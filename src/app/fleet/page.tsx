import { redirect } from 'next/navigation';

// Canonical redirect — avoids duplicate content penalties
export default function FleetPage() {
  redirect('/cars');
}

