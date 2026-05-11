import Hero from '@/components/Hero';
import FeaturedCars from '@/components/FeaturedCars';
import WhyChooseUs from '@/components/WhyChooseUs';
import RentalProcess from '@/components/RentalProcess';
import CustomerReviews from '@/components/CustomerReviews';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';

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
