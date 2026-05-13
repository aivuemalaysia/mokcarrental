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
    <html lang="en">
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
