import type { Metadata, ResolvingMetadata } from 'next';

import { notFound } from 'next/navigation';

import Image from 'next/image';

import Link from 'next/link';

import { FiUsers, FiSettings, FiZap, FiCheck, FiArrowLeft, FiImage } from 'react-icons/fi';

import { getSupabaseServerClient } from '@/lib/supabaseServer';

import { Car } from '@/types';

import CarCard from '@/components/CarCard';

import WhatsAppInquiryButton from '@/components/WhatsAppInquiryButton';
import BookingHandoffLink from '@/components/BookingHandoffLink';
import { isLegacyVehicleId } from '@/lib/seo';



type Props = { params: Promise<{ id: string }> };



// Dynamic SEO metadata per car

export async function generateStaticParams() {
  try {
    const { data } = await getSupabaseServerClient()
      .from('cars')
      .select('id')
      .eq('available', true);

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

  // Malformed route parameters must not generate UUID database errors.
  if (!isLegacyVehicleId(id)) {
    return { title: 'Car Not Found', robots: { index: false, follow: false } };
  }

  try {

    const { data: car } = await getSupabaseServerClient()

      .from('cars')

      .select('*')

      .eq('id', id)

      .single();



    if (!car) {

      return { title: 'Car Not Found', robots: { index: false, follow: false } };

    }



    const baseUrl = 'https://www.mokcarrental.com';



    const name = car.name || `${car.brand} ${car.model}`;

    // Legacy website prices are not the live booking quotation.

    const category = car.category || 'car';



    return {

      title: `${name} Rental in Johor Bahru`,

      description: `Explore ${name} (${category}) rental information in Johor Bahru. Check live prices, availability and booking conditions in the MOK booking app.`,

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

        title: `${name} Rental Johor Bahru | MOK`,

        description: `Compare ${name} vehicle details in Johor Bahru. Current rental options and quotations are available through MOK booking.`,

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



async function fetchCar(id: string): Promise<Car | null> {
  // Return 404 only when the vehicle truly does not exist.
  // A database outage must remain a retryable 5xx, not a soft 404.
  const { data, error } = await getSupabaseServerClient()
    .from('cars')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Car | null;
}


async function fetchRelatedCars(car: Car, carId: string) {

  try {
    const { data } = await getSupabaseServerClient()
    

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



export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;



  if (!isLegacyVehicleId(id)) notFound();

  const baseUrl = 'https://www.mokcarrental.com';
  const car = await fetchCar(id);



  if (!car) notFound();

  const relatedCars = await fetchRelatedCars(car, id);

  const mainImageSrc = typeof car.image === 'string' ? car.image.trim() : '';

  const galleryImages = Array.isArray(car.images)

    ? car.images.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)

    : [];



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

    url: `${baseUrl}/cars/${car.id}`,


  };



  // BreadcrumbList structured data

  const breadcrumbJsonLd = {

    '@context': 'https://schema.org',

    '@type': 'BreadcrumbList',

    itemListElement: [

      { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}` },

      { '@type': 'ListItem', position: 2, name: 'Our Fleet', item: `${baseUrl}/cars` },

      { '@type': 'ListItem', position: 3, name: car.name },

    ],

  };



  return (

    <main>

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

              {car.brand} {car.model} · {car.category} Rental in Johor Bahru

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

                      sizes="(max-width: 1023px) 100vw, 66vw"
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

                          sizes="(max-width: 767px) 33vw, 220px"
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

                      <span>Rental duration is confirmed during booking</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <FiCheck className="w-5 h-5 text-gold-500 mt-1 flex-shrink-0" />

                      <span>Check the current mileage terms in the MOK booking app</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <FiCheck className="w-5 h-5 text-gold-500 mt-1 flex-shrink-0" />

                      <span>Confirm the security deposit and refund terms before payment</span>

                    </li>

                    <li className="flex items-start gap-2">

                      <FiCheck className="w-5 h-5 text-gold-500 mt-1 flex-shrink-0" />

                      <span>Confirm the fuel and return policy with MOK</span>

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

                    <div className="text-lg font-bold text-gray-900 mb-2">Check live rental rates</div>
                    <p className="text-sm leading-relaxed text-gray-600">Vehicle information on this page is not a live availability or pricing guarantee. Continue to MOK PWA to see the current quotation for your dates.</p>

                  </div>



                  <div className="space-y-4 mb-8">

                    <BookingHandoffLink
                      
                      className="btn-primary w-full justify-center text-lg block text-center"
                    >
                      Check current cars in MOK PWA
                    </BookingHandoffLink>

                    <WhatsAppInquiryButton
                      label="Ask About This Car on WhatsApp"
                      className="btn-whatsapp w-full justify-center text-lg"
                      prefillCar={{ id: car.id, name: car.name }}
                    />

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

    </main>

  );

}



