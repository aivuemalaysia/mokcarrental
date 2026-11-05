import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiArrowUpRight, FiCheckCircle } from 'react-icons/fi';
import BookingHandoffLink from '@/components/BookingHandoffLink';

export default function Hero() {
  return <section aria-label="Car rental in Johor Bahru" className="relative isolate overflow-hidden bg-[#191B1D] pb-20 pt-36 text-white md:pb-24 md:pt-44">
    <div className="pointer-events-none absolute inset-0 z-[-1]">
      <Image src="/brand/mok-hero-2026.webp" alt="" fill sizes="100vw" priority
        className="object-cover object-center opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#101214]/95 via-[#191B1D]/90 to-[#17191B]/60"/>
    </div>
    <div className="container-custom relative">
      <div className="max-w-4xl">
        <p className="mb-6 inline-flex rounded-full border border-[#FF923F]/40 bg-[#FF761A]/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-[#FFAF77]">Johor Bahru, Malaysia · Rental guides & booking</p>
        <h1 className="text-[clamp(2.75rem,7vw,5.7rem)] font-extrabold leading-[1.06] tracking-[-.055em]">
          Car Rental in <span className="text-[#FF923F]">Johor Bahru.</span>
          <span className="mt-2 block text-white">Explore JB on your terms.</span>
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#D7DADD] md:text-xl">
          Compare vehicle types for family trips, business travel and your next visit to JB. Find useful local information here, then check live cars and dates in the MOK booking app.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <BookingHandoffLink  className="btn-primary text-base">Check Available Cars <FiArrowUpRight aria-hidden="true"/></BookingHandoffLink>
          <Link href="#rental-services" className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-semibold text-white hover:border-[#FF923F] hover:bg-white/10">Explore Rental Types <FiArrowRight aria-hidden="true"/></Link>
        </div>
        <div className="mt-14 grid max-w-3xl gap-5 border-t border-white/15 pt-6 text-sm text-gray-200 sm:grid-cols-3">
          {['Johor Bahru rental guides','Vehicle options for different trips','Live dates and rates in MOK app'].map(x=><div key={x} className="flex items-start gap-2"><FiCheckCircle aria-hidden="true" className="mt-0.5 flex-shrink-0 text-[#FF923F]"/>{x}</div>)}
        </div>
      </div>
    </div>
  </section>;
}
