import BookingPageClient from './BookingPageClient';

export default function BookingPage({
  searchParams,
}: {
  searchParams?: { car?: string };
}) {
  return <BookingPageClient initialCarId={searchParams?.car || ''} />;
}
