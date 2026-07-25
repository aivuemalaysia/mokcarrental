import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
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
        url: `${siteUrl}/og-image.jpg`,
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
      {/* JSON-LD Structured Data for LocalBusiness SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CarRental',
            name: 'Mok Car Rental',
            description: 'Affordable and reliable car rental services in Johor Bahru, Malaysia. Serving Singapore customers, tourists, and locals.',
            url: siteUrl,
            telephone: '+60-XXXX-XXXXXX',
            email: 'info@mokcarrental.com',
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
            priceRange: '$$',
            areaServed: [
              {
                '@type': 'City',
                name: 'Johor Bahru',
              },
              {
                '@type': 'City',
                name: 'Singapore',
              },
            ],
            servesCuisines: null,
            sameAs: [],
          }),
        }}
      />
    </head>
      <body className="antialiased">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-gold-500 focus:text-white focus:rounded-lg"
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
