import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiUsers, FiSettings, FiZap, FiCheck, FiArrowLeft, FiImage } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { Car } from '@/types';
import CarCard from '@/components/CarCard';
import WhatsAppInquiryButton from '@/components/WhatsAppInquiryButton';
;

type Props = { params: Promise<{ id: string }> };

// Dynamic SEO metadata per car
export async function generateStaticParams() {
  try {
    const { data } = await supabase.from('cars').select('id');
    return (data || []).map((car: any) => ({ id: car.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data: car } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();

    if (!car) {
      return { title: 'Car Not Found | Mok Car Rental JB' };
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const name = car.name || `${car.brand} ${car.model}`;
    const price = car.price || 'N/A';
    const category = car.category || 'car';

    return {
      title: `${name} â€” ${price}/day Rental | Johor Bahru Car Rental`,
      description: `Rent the ${name} (${category}) in Johor Bahru from RM${price}/day. ${car.description || 'Well-maintained vehicle with premium features.'} Perfect for Singapore travelers, airport transfers, and JB city exploration.`,
      keywords: [
        `${name} rental jb`,
        `${name} johor bahru`,
        `${car.brand} rental jb`,
        `rent ${name} johor bahru`,
        'car rental jb',
        'alphard rental jb',
        'mpv rental jb',
      ].join(', '),
      openGraph: {
        title: `${name} â€” RM${price}/day | Mok Car Rental JB`,
        description: `Rent the ${name} in Johor Bahru from RM${price}/day. Prime vehicle with ${car.seats} seats, ${car.transmission} transmission.`,
        url: `${baseUrl}/cars/${id}`,
        type: 'website',
        locale: 'en_MY',
        siteName: 'Mok Car Rental',
        images: car.image ? [{ url: car.image, alt: name }] : [],
      },
      alternates: {
        canonical: `${baseUrl}/cars/${id}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: 'Car Details | Mok Car Rental JB',
      description: 'View detailed information about our rental cars in Johor Bahru.',
    };
  }
}

async function fetchCar(id: string) {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as Car;
  } catch {
    return null;
  }
}

async function fetchRelatedCars(car: Car, carId: string) {
  try {
    const { data } = await supabase
      .from('cars')
      .select('*')
      .eq('category', car.category)
      .neq('id', carId)
      .eq('available', true)
      .limit(3);
    return (data || []) as Car[];
  } catch {
    return [];
  }
}

export default async function CarDetailPage() {
  const params = await useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const car = await fetchCar(id);

  if (!car) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Car Not Found</h1>
          <Link href="/cars" className="btn-primary">Back to Cars</Link>
        </div>
      </div>
    );
  }

  const relatedCars = await fetchRelatedCars(car, id);
  const mainImageSrc = typeof car.image === 'string' ? car.image.trim() : '';
  const galleryImages = Array.isArray(car.images)
    ? car.images.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    : [];<any>((resolve) => {
    // Default site settings â€” actual settings come from context on client
    resolve({ whatsappNumber: '', email: '', workingHours: '' });
  });

  // JSON-LD structured data for this specific car (Product + Offer schema)
  const carJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: car.name,
    description: car.description || `Premium ${car.category} rental in Johor Bahru. ${car.seats} seats, ${car.transmission}, ${car.fuel_type}.`,
    brand: { '@type': 'Brand', name: car.brand },
    model: car.model,
    category: car.category,
    image: mainImageSrc ? [mainImageSrc] : undefined,
    vehicleConfiguration: car.transmission,
    seatingCapacity: { '@type': 'QuantitativeValue', value: car.seats },
    fuelType: car.fuel_type,
    offers: {
      '@type': 'Offer',
      price: String(car.price),
      priceCurrency: 'MYR',
      availability: car.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mokcarrental.com'}/cars/${car.id}`,
      seller: {
        '@type': 'LocalBusiness',
        name: 'Mok Car Rental',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Johor Bahru',
          addressRegion: 'Johor',
          addressCountry: 'MY',
        },
      },
    },
  };

  // BreadcrumbList structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mokcarrental.com' },
      { '@type': 'ListItem', position: 2, name: 'Our Fleet', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mokcarrental.com'}/cars` },
      { '@type': 'ListItem', position: 3, name: car.name },
    ],
  };

  return (
    <>
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="pt-20">
        <nav aria-label="Breadcrumb" className="bg-gray-50 py-3">
          <div className="container-custom">
            <ol className="flex items-center gap-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-gold-500">Home</Link></li>
              <li className="text-gray-400">/</li>
              <li><Link href="/cars" className="hover:text-gold-500">Our Fleet</Link></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">{car.name}</li>
            </ol>
          </div>
        </nav>

        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
          <div className="container-custom">
            <Link href="/cars" className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 mb-4">
              <FiArrowLeft />
              Back to Cars
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-bold">{car.name}</h1>
            <p className="text-xl text-gray-300 mt-2 capitalize">
              {car.brand} {car.model} Â· {car.category} Rental in Johor Bahru
            </p>
          </div>
        </div>

        <section className="py-12">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden mb-6">
                  {mainImageSrc ? (
                    <Image
                      src={mainImageSrc}
                      alt={`${car.name} rental car Johor Bahru`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                      <FiImage className="h-12 w-12" />
                    </div>
                  )}
                </div>

                {galleryImages.length > 1 && (
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {galleryImages.map((image, index) => (
                      <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`${car.name} view ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                  <h2 className="text-2xl font-bold mb-4">About This {car.category.charAt(0).toUpperCase() + car.category.slice(1)}</h2>
                  <p className="text-gray-700 leading-relaxed">{car.description || 'A well-maintained vehicle perfect for your Johor Bahru experience.'}</p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                  <h2 className="text-2xl font-bold mb-6">Specifications</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <FiUsers className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                      <div className="font-bold text-lg">{car.seats}</div>
                      <div className="text-sm text-gray-600">Seats</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <FiSettings className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                      <div className="font-bold text-lg capitalize">{car.transmission}</div>
                      <div className="text-sm text-gray-600">Transmission</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <FiZap className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                      <div className="font-bold text-lg capitalize">{car.fuel_type}</div>
                      <div className="text-sm text-gray-600">Fuel Type</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <FiZap className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                      <div className="font-bold text-lg capitalize">{car.category}</div>
                      <div className="text-sm text-gray-600">Category</div>
                    </div>
                  </div>
                </div>

                {car.features && car.features.length > 0 && (
                  <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                    <h2 className="text-2xl font-bold mb-6">Features & Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {car.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FiCheck className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold mb-6">Rental Terms</h2>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-5 h-5 text-gold-500 mt-1 flex-shrink-0" />
                      <span>Minimum rental period: 1 day</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-5 h-5 text-gold-500 mt-1 flex-shrink-0" />
                      <span>Daily mileage allowance: 200km (RM0.30 per additional km)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-5 h-5 text-gold-500 mt-1 flex-shrink-0" />
                      <span>Security deposit: RM200-500 (refundable upon return)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-5 h-5 text-gold-500 mt-1 flex-shrink-0" />
                      <span>Fuel policy: Full-to-full</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheck className="w-5 h-5 text-gold-500 mt-1 flex-shrink-0" />
                      <span>Valid driving license required</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-8 shadow-lg sticky top-24">
                  <div className="mb-6">
                    <div className="text-sm text-gray-600 mb-1">Daily Rate</div>
                    <div className="text-4xl font-bold text-gold-500">
                      RM{car.price}
                      <span className="text-lg text-gray-600 font-normal">/day</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <WhatsAppInquiryButton
                      label="Book via WhatsApp"
                      className="btn-whatsapp w-full justify-center text-lg"
                      prefillCar={{ id: car.id, name: car.name }}
                    />
                    <Link
                      href={`/booking?car=${car.id}`}
                      className="btn-primary w-full justify-center text-lg block text-center"
                    >
                      Online Inquiry
                    </Link>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-bold mb-4">Contact Us</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Need help choosing? Chat with us on WhatsApp for instant response.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {relatedCars.length > 0 && (
              <div className="mt-16">
                <h2 className="text-3xl font-bold mb-8">Similar Cars for Rent in Johor Bahru</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedCars.map((relatedCar) => (
                    <CarCard key={relatedCar.id} car={relatedCar} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}


