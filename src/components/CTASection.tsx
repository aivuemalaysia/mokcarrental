import { FiArrowUpRight } from 'react-icons/fi';
import BookingHandoffLink from '@/components/BookingHandoffLink';
export default function CTASection(){
 return <section className="bg-[#FF761A] py-20 text-[#17191B] md:py-24" aria-labelledby="booking-cta">
  <div className="container-custom flex flex-col justify-between gap-8 md:flex-row md:items-center">
   <div className="max-w-3xl">
    <p className="mb-3 text-xs font-extrabold uppercase tracking-[.18em]">Ready when you are</p>
    <h2 id="booking-cta" className="text-4xl font-black tracking-tight md:text-5xl">Your next JB drive starts here.</h2>
    <p className="mt-5 text-lg">Check current rental availability and complete your booking in MOK PWA.</p>
   </div>
   <BookingHandoffLink  className="inline-flex min-h-[52px] flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#191B1D] px-7 py-4 font-bold text-white hover:bg-[#35383B]">Check Available Cars <FiArrowUpRight aria-hidden="true"/></BookingHandoffLink>
  </div>
 </section>;
}
