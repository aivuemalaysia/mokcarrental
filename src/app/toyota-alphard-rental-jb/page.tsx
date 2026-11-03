import type { Metadata } from 'next';
import Link from 'next/link';
import { FiArrowUpRight, FiCheckCircle } from 'react-icons/fi';
import { canonicalFor } from '@/lib/seo';
import { MOK_BOOKING_URL } from '@/lib/bookingHandoff';
export const metadata: Metadata = {
 title: 'Toyota Alphard Rental in Johor Bahru | MOK Car Rental',
 description: 'Compare Toyota Alphard and premium MPV rental considerations in JB. Review seating, luggage and current available models through MOK.',
 alternates:{canonical:canonicalFor('/toyota-alphard-rental-jb')},
 openGraph:{title:'Toyota Alphard Rental in Johor Bahru | MOK',url:canonicalFor('/toyota-alphard-rental-jb')}
};
const items=[{"title":"Passenger comfort","text":"Compare the actual seating layout and passenger count for your group."},{"title":"Luggage capacity","text":"Consider suitcases, child seats and the space remaining with every seat occupied."},{"title":"Prices and availability","text":"Model availability, rental rates and deposit requirements depend on the current booking quotation."}];
export default function LandingPage(){
 return <>
  <section className="bg-[#1B1D1F] pb-20 pt-36 text-white">
   <div className="container-custom max-w-5xl">
    <Link href="/" className="text-sm font-semibold text-[#FF923F] hover:underline">Home</Link><span className="mx-2 text-gray-500">/</span><span className="text-sm text-gray-300">Premium MPV rental guide</span>
    <p className="mt-12 text-xs font-extrabold uppercase tracking-[.2em] text-[#FF923F]">Premium MPV rental guide</p>
    <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">Toyota Alphard Rental in Johor Bahru</h1>
    <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#CFD4D6]">The Toyota Alphard is a premium multi-purpose vehicle often considered for group, family and business travel. Compare the exact vehicle generation, seating configuration and luggage needs before choosing a rental in Johor Bahru.</p>
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
   <div className="mt-8 flex flex-wrap gap-3"><a href={MOK_BOOKING_URL} className="btn-primary">Check live rental options</a><Link href="/cars" className="btn-secondary">Compare vehicle types</Link></div>
  </div></section>
 </>;
}
