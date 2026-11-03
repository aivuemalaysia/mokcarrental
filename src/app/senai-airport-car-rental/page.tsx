import type { Metadata } from 'next';
import Link from 'next/link';
import { FiArrowUpRight, FiCheckCircle } from 'react-icons/fi';
import { canonicalFor, MOK_SOCIAL_IMAGE } from '@/lib/seo';
import { MOK_BOOKING_URL } from '@/lib/bookingHandoff';
export const metadata: Metadata = {
 title: 'Senai Airport Car Rental in Johor Bahru',
 description: 'Arriving at Senai International Airport (JHB)? Learn about rental handover, trip planning and how to check current available cars with MOK.',
 alternates:{canonical:canonicalFor('/senai-airport-car-rental')},
 openGraph:{title:'Senai Airport Car Rental in Johor Bahru | MOK',url:canonicalFor('/senai-airport-car-rental'),images:[MOK_SOCIAL_IMAGE]}
};
const items=[{"title":"Arrival timing","text":"Allow time after landing for bags, immigration if applicable and any onward connection."},{"title":"Handover point","text":"Confirm where and when the car is collected. Airport delivery must not be assumed."},{"title":"Documents and terms","text":"Check driver licence, ID, deposit, insurance and cancellation conditions during booking."}];
export default function LandingPage(){
 return <main>
  <section className="bg-[#1B1D1F] pb-20 pt-36 text-white">
   <div className="container-custom max-w-5xl">
    <Link href="/" className="text-sm font-semibold text-[#FF923F] hover:underline">Home</Link><span className="mx-2 text-gray-500">/</span><span className="text-sm text-gray-300">Airport rental planning</span>
    <p className="mt-12 text-xs font-extrabold uppercase tracking-[.2em] text-[#FF923F]">Airport rental planning</p>
    <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">Senai Airport Car Rental in Johor Bahru</h1>
    <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#CFD4D6]">If your journey starts at Senai International Airport (JHB), plan enough time for luggage collection and transport to the agreed handover point. Ask MOK whether an airport arrangement is possible for your dates and whether charges apply.</p>
    <a href={MOK_BOOKING_URL} className="btn-primary mt-8">Check Available Cars <FiArrowUpRight aria-hidden="true"/></a>
   </div>
  </section>
  <section className="bg-white py-20"><div className="container-custom max-w-5xl">
   <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">What to consider before booking</h2>
   <p className="mt-5 max-w-3xl leading-relaxed text-gray-700">MOK's website provides practical rental information, while the MOK booking app handles current availability and prices. Details such as handover arrangements, deposits, driver requirements and rental conditions should always be verified for your dates.</p>
   <div className="mt-10 grid gap-5 md:grid-cols-3">{items.map((item)=><article key={item.title} className="rounded-3xl border border-[#DFE2E4] bg-[#F7F7F5] p-7">
    <FiCheckCircle aria-hidden="true" className="h-7 w-7 text-[#D95706]"/><h3 className="mt-5 text-xl font-bold">{item.title}</h3><p className="mt-3 leading-relaxed text-gray-600">{item.text}</p></article>)}</div>
   <h2 className="mt-16 text-2xl font-bold">Next steps for your Johor Bahru rental</h2>
   <p className="mt-4 max-w-3xl leading-relaxed text-gray-700">Use your travel dates and group requirements to compare current options. Request confirmation of pickup location, optional services and final charges before relying on an arrangement.</p>
   <div className="mt-8 flex flex-wrap gap-3"><a href={MOK_BOOKING_URL} className="btn-primary">Check live rental options</a><Link href="/contact" className="btn-secondary">Ask about airport handover</Link></div>
  </div></section>
 </main>;
}
