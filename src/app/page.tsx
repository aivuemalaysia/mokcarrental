import Hero from '@/components/Hero';
import FeaturedCars from '@/components/FeaturedCars';
import WhyChooseUs from '@/components/WhyChooseUs';
import RentalProcess from '@/components/RentalProcess';
import CustomerReviews from '@/components/CustomerReviews';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';

export const metadata = {
  title: 'Affordable Car Rental Johor Bahru | Mok Car Rental JB',
  description: 'Premium yet affordable car rental in Johor Bahru. Perfect for Singapore customers crossing the causeway, tourists visiting JB, and locals. Alphard, MPV, sedan & luxury fleet with airport delivery at Senai.',
  keywords: [
    'car rental johor bahru',
    'affordable car rental jb',
    'senai airport car rental',
    'singapore to jb car rental',
    'alphard rental jb',
  ].join(', '),
  openGraph: {
    title: 'Mok Car Rental — Affordable Car Rental Johor Bahru',
    description: 'Premium yet affordable car rental in Johor Bahru. Serving Singapore customers, tourists & locals. Alphard, MPV, sedan & luxury fleet.',
    type: 'website',
    locale: 'en_MY',
    url: 'https://www.mokcarrental.com',
    siteName: 'Mok Car Rental',
    images: [
      {
        url: 'https://www.mokcarrental.com/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Mok Car Rental Johor Bahru',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mok Car Rental — Affordable Car Rental Johor Bahru',
    description: 'Premium yet affordable car rental in Johor Bahru. Serving Singapore customers, tourists & locals.',
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCars />
      <WhyChooseUs />
      <RentalProcess />
      <CustomerReviews />
      <FAQ />
      <CTASection />
    </>
  );
}
