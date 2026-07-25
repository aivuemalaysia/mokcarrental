import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import FeaturedCars from '@/components/FeaturedCars';
import WhyChooseUs from '@/components/WhyChooseUs';
import RentalProcess from '@/components/RentalProcess';
import CustomerReviews from '@/components/CustomerReviews';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';
import SEODynamicContent from '@/components/SEODynamicContent';

const baseUrl = process.env.SITE_URL || 'https://www.mokcarrental.com';

export const metadata: Metadata = {
  title: 'Best Car Rental Johor Bahru | Affordable Rates | Mok Car Rental JB',
  description:
    '#1 affordable car rental in Johor Bahru. Alphard, MPV, sedan & luxury fleet from RM150/day. Serving Singapore customers crossing the Causeway. Free airport delivery at Senai. WhatsApp booking available.',
  keywords: [
    'car rental Johor Bahru',
    'car rental JB',
    'affordable car rental JB',
    'cheap car rental Johor Bahru',
    'best car rental JB',
    'Alphard rental JB',
    'MPV rental Johor Bahru',
    'car rental Singapore to JB',
    'Singapore to JB car rental',
    'Senai airport car rental',
    'Johor Bahru car hire',
    'self drive car rental JB',
    'car rental with driver JB',
    'luxury car rental JB',
    'car rental near Woodlands Causeway',
    'car rental near Tuas Checkpoint',
    'economy car rental JB',
    'family car rental Johor Bahru',
  ].join(', '),
  openGraph: {
    title: 'Best Car Rental Johor Bahru — Affordable Rates from RM150/Day',
    description:
      'Premium yet affordable car rental in Johor Bahru. Perfect for Singapore customers crossing the causeway, tourists visiting JB, and locals. Alphard, MPV, sedan & luxury fleet with airport delivery at Senai.',
    type: 'website',
    locale: 'en_MY',
    url: baseUrl,
    siteName: 'Mok Car Rental',
    images: [
      {
        url: `${baseUrl}/og-home.jpg`,
        width: 1200,
        height: 630,
        alt: 'Mok Car Rental - Best Affordable Car Rental Johor Bahru',
      },
    ],
  },
  alternates: {
    canonical: baseUrl,
  },
};

// FAQPage JSON-LD for rich snippets in Google search results
function getFAQStructuredData() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much does it cost to rent a car in Johor Bahru?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Car rental in Johor Bahru starts from RM150/day for economy sedans like the Perodua Bezza, up to RM600/day for premium vehicles like the Toyota Alphard. mokcarrental.com offers competitive rates with no hidden fees.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do Singapore drivers need an international driving permit to rent a car in Johor Bahru?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No, Singapore driving licenses are fully accepted in Malaysia. You can drive legally with your valid Singapore license when renting a car in Johor Bahru. International driving permits are also accepted.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I pick up my rental car at Senai Airport Johor Bahru?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we offer convenient pickup and drop-off services at Senai International Airport (JHB). Airport delivery is available at an additional fee. Contact us via WhatsApp to arrange your airport pickup.',
        },
      },
      {
        '@type': 'Question',
        name: 'What documents do I need to rent a car in Johor Bahru?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You need a valid driving license (Singapore or international), a minimum age of 21 years, and a security deposit of RM200-500 depending on the car category. Your passport or IC is also recommended.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a mileage limit for car rentals in Johor Bahru?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our standard rental includes 200km per day for most vehicles. Additional distance is charged at RM0.30-0.50 per km. Unlimited mileage packages are available upon request for longer trips.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer car rental from Singapore to Johor Bahru?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we specialize in serving Singapore customers who cross the Causeway to Johor Bahru. We offer convenient pick-up at the border, Woodlands, or Tuas checkpoints. Book your car in advance via WhatsApp for seamless arrangements.',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of cars are available for rental in Johor Bahru?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We offer a wide range of vehicles including economy sedans (Perodua Bezza, Honda City), MPVs (Toyota Alphard, Honda Odyssey), SUVs, and luxury cars. All vehicles are well-maintained, air-conditioned, and sanitized before each rental.',
        },
      },
    ],
  });
}

// BreadcrumbList structured data for homepage
function getBreadcrumbSchema() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
    ],
  });
}

export default function Home() {
  return (
    <>
      {/* Structured Data Scripts */}      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: getFAQStructuredData() }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: getBreadcrumbSchema() }}
      />
      <Hero />
      <FeaturedCars />
      <WhyChooseUs />
      <RentalProcess />
      <CustomerReviews />
      <FAQ />
      <CTASection />
      <SEODynamicContent />
    </>
  );
}
