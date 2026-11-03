import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

import { SEO_ORIGIN } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SEO_ORIGIN),
  title: {
    default: 'Car Rental Johor Bahru (JB) | MOK Car Rental',
    template: '%s | MOK Car Rental',
  },
  description: 'Explore car rental in Johor Bahru with MOK. Compare vehicle types, learn about renting in JB and Senai Airport, and book through our online rental app.',
  authors: [{ name: 'MOK Car Rental' }],
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    siteName: 'MOK Car Rental',
    title: 'Car Rental Johor Bahru | MOK Car Rental',
    description: 'Johor Bahru car rental information and online booking. Explore vehicle options, airport rental guidance and trip planning with MOK.',
    images: [{ url: SEO_ORIGIN + '/og-home.jpg', width: 1200, height: 630, alt: 'MOK Car Rental in Johor Bahru' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Car Rental Johor Bahru | MOK Car Rental',
    description: 'Explore car rental options in JB and continue to the MOK booking app.',
    images: [SEO_ORIGIN + '/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

// Avoid publishing unverifiable street addresses, coordinates, review totals,
// rates or opening hours as structured data. Business facts must be verified
// before they are added to either schema or visible page copy.
const organizationSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': SEO_ORIGIN + '/#website',
      url: SEO_ORIGIN + '/',
      name: 'MOK Car Rental',
      inLanguage: 'en-MY',
      publisher: { '@id': SEO_ORIGIN + '/#business' },
    },
    {
      '@type': 'AutoRental',
      '@id': SEO_ORIGIN + '/#business',
      name: 'MOK Car Rental',
      url: SEO_ORIGIN + '/',
      areaServed: [{ '@type': 'City', name: 'Johor Bahru' }],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-MY" dir="ltr">
      <head>
        <meta name="theme-color" content="#FF761A" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <link rel="icon" type="image/png" sizes="192x192" href="/brand/mok-icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/brand/mok-apple-touch-icon.png" />
      </head>
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-[#FF761A] focus:px-4 focus:py-2 focus:text-[#17191B]">
          Skip to main content
        </a>
        <ClientLayout>
          <div id="main-content">{children}</div>
        </ClientLayout>

      </body>
    </html>
  );
}
