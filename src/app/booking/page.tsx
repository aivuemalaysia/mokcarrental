import Hero from '@/components/Hero';
import FeaturedCars from '@/components/FeaturedCars';
import WhyChooseUs from '@/components/WhyChooseUs';
import RentalProcess from '@/components/RentalProcess';
import CustomerReviews from '@/components/CustomerReviews';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';
import BookingPageClient from './BookingPageClient';

export const metadata = {
  title: 'Book a Car — Reserve Online',
  description: 'Book your rental car in Johor Bahru. Choose dates, select your vehicle, and confirm your reservation with Mok Car Rental.',
  alternates: { canonical: '/booking' },
};
export default function BookingPage({
  searchParams,
}: {
  searchParams?: { car?: string };
}) {
  return <BookingPageClient initialCarId={searchParams?.car || ''} />;
}
