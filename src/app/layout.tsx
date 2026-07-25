import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const siteUrl =
  process.env.SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mok Car Rental — Affordable Car Rental Johor Bahru | Singapore Customers Welcome",
    template: "%s | Mok Car Rental JB",
  },
  description:
    "Affordable, reliable car rental in Johor Bahru, Malaysia. Serving Singapore customers, tourists & locals. Alphard, MPV, luxury cars with airport delivery. Book via WhatsApp or online.",
  keywords: [
    "car rental Johor Bahru",
    "car rental JB",
    "rental car JB",
    "car rental Singapore to Johor Bahru",
    "Singapore to JB car rental",
    "Alphard rental JB",
    "MPV rental Johor Bahru",
    "cheap car rental JB",
    "luxury car rental Malaysia",
    "Senai airport car rental",
    "Johor Bahru car hire",
    "self drive car rental JB",
    "car rental with driver JB",
    "best car rental JB",
    "car rental near Causeway",
    "economy car rental JB",
    "family car rental Johor Bahru",
  ],
  authors: [{ name: "Mok Car Rental" }],
  alternates: {
    canonical: siteUrl,
    languages: {
      en: siteUrl,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_MY",
    url: siteUrl,
    siteName: "Mok Car Rental",
    title: "Mok Car Rental — Premium Car Rental Johor Bahru",
    description:
      "Affordable car rental in Johor Bahru serving Singapore customers. Alphard, MPV, luxury cars with airport delivery. Book via WhatsApp.",
    images: [
      {
        url: `${siteUrl}/og-home.jpg`,
        width: 1200,
        height: 630,
        alt: "Mok Car Rental - Premium Car Rental Johor Bahru",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mokcarrental",
    title: "Mok Car Rental — Car Rental Johor Bahru",
    description:
      "Affordable, reliable car rental in Johor Bahru. Serving Singapore customers and tourists.",
    images: [`${siteUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

// Comprehensive JSON-LD structured data for local SEO
function getStructuredData() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}#website`,
        url: siteUrl,
        name: 'Mok Car Rental',
        description: 'Affordable and reliable car rental services in Johor Bahru, Malaysia. Serving Singapore customers, tourists, and locals.',
        publisher: {
          '@id': `${siteUrl}#localbusiness`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/cars?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SiteNavigationElement',
        '@container': '@list',
        position: 1,
        name: 'Home',
        url: `${siteUrl}`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 2,
        name: 'Our Fleet',
        url: `${siteUrl}/cars`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 3,
        name: 'About Us',
        url: `${siteUrl}/about`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 4,
        name: 'FAQ',
        url: `${siteUrl}/faq`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 5,
        name: 'Contact',
        url: `${siteUrl}/contact`,
      },
      {
        '@type': 'CarRental',
        '@id': `${siteUrl}#business`,
        name: 'Mok Car Rental',
        description: 'Affordable and reliable car rental services in Johor Bahru, Malaysia. Serving Singapore customers, tourists, and locals.',
        url: siteUrl,
        priceRange: '$$',
        image: `${siteUrl}/og-home.jpg`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Johor Bahru',
          addressLocality: 'Johor Bahru',
          addressRegion: 'Johor',
          postalCode: '80000',
          addressCountry: 'MY',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 1.4927,
          longitude: 103.7414,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
          ],
          opens: '08:00',
          closes: '22:00',
        },
        areaServed: [
          {
            '@type': 'City',
            name: 'Johor Bahru',
            description: 'Johor Bahru, Johor, Malaysia',
          },
          {
            '@type': 'City',
            name: 'Singapore',
            description: 'Singapore',
          },
        ],
        servesCarMakes: [
          { '@type': 'Vehicle', name: 'Toyota Alphard' },
          { '@type': 'Vehicle', name: 'Honda Odyssey' },
          { '@type': 'Vehicle', name: 'Perodua Bezza' },
          { '@type': 'Vehicle', name: 'Toyota Vellfire' },
          { '@type': 'Vehicle', name: 'Honda City' },
          { '@type': 'Vehicle', name: 'Mercedes-Benz' },
        ],
        paymentAccepted: 'Cash, Bank Transfer, GrabPay, Touch ' + "'n' Go'",
        currencyAccepted: ['MYR', 'SGD'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Car Rental Fleet',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'CarRental',
                name: 'Economy Sedan',
                description: 'Perodua Bezza, Honda City - from RM150/day',
              },
              price: '150',
              priceCurrency: 'MYR',
              unitCode: 'DAY',
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'CarRental',
                name: 'Premium MPV',
                description: 'Toyota Alphard, Honda Odyssey - from RM400/day',
              },
              price: '400',
              priceCurrency: 'MYR',
              unitCode: 'DAY',
            },
          ],
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${siteUrl}#localbusiness`,
        name: 'Mok Car Rental Johor Bahru',
        description:
          'Best affordable car rental service in Johor Bahru, Malaysia. Specializing in Alphard rentals, MPV hire, and luxury cars for Singapore travelers and tourists.',
        url: siteUrl,
        image: `${siteUrl}/og-home.jpg`,
        priceRange: 'RM150 - RM600/day',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Johor Bahru',
          addressLocality: 'Johor Bahru',
          addressRegion: 'Johor',
          postalCode: '80000',
          addressCountry: 'MY',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 1.4927,
          longitude: 103.7414,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
          ],
          opens: '08:00',
          closes: '22:00',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '200',
          bestRating: '5',
          worstRating: '1',
        },
        sameAs: [],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Cars',
            item: `${siteUrl}/cars`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'About',
            item: `${siteUrl}/about`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'FAQ',
            item: `${siteUrl}/faq`,
          },
          {
            '@type': 'ListItem',
            position: 5,
            name: 'Contact',
            item: `${siteUrl}/contact`,
          },
        ],
      },
    ],
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* JSON-LD Structured Data for LocalBusiness, CarRental & Website SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: getStructuredData() }}
      />
    </head>
      <body className="antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>
        <ClientLayout>
        <main id="main-content">{children}</main>
      </ClientLayout>
      </body>
    </html>
  );
}
