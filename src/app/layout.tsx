import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const metadataBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: {
    default: "Mok Car Rental - Premium Car Rental in Johor Bahru, Malaysia",
    template: "%s | Mok Car Rental",
  },
  description:
    "Affordable, reliable, and hassle-free rental cars in Johor Bahru (JB), Malaysia. Perfect for Singapore customers, tourists, and locals. Airport delivery available.",
  keywords: [
    "car rental JB",
    "Johor Bahru car rental",
    "rental car JB",
    "Singapore to JB rental",
    "cheap car rental JB",
    "Alphard rental JB",
    "MPV rental JB",
    "luxury car rental Malaysia",
  ],
  authors: [{ name: "Mok Car Rental" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Mok Car Rental",
    title: "Mok Car Rental - Premium Car Rental in Johor Bahru",
    description:
      "Affordable, reliable, and hassle-free rental cars in Johor Bahru. Perfect for Singapore customers and tourists.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mok Car Rental - Premium Car Rental in Johor Bahru",
    description:
      "Affordable, reliable, and hassle-free rental cars in Johor Bahru.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
    <head>
      {/* JSON-LD Structured Data for LocalBusiness SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CarRental',
            name: 'Mok Car Rental',
            description: 'Affordable, reliable, and hassle-free rental cars in Johor Bahru, Malaysia',
            url: 'https://mokcarrental.com',
            telephone: '+60-XXX-XXXXXXX',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Johor Bahru',
              addressLocality: 'Johor Bahru',
              addressRegion: 'Johor',
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
            priceRange: '\$\$',
            areaServed: {
              '@type': 'GeoCircle',
              geoMidpoint: {
                '@type': 'GeoCoordinates',
                latitude: 1.4927,
                longitude: 103.7414,
              },
              geoRadius: '50000',
            },
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
