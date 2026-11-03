import { FiSearch, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { MOK_BOOKING_URL } from '@/lib/bookingHandoff';
const steps=[
 {icon:FiSearch,title:'Explore rental options',desc:'Find vehicle information and rental guidance on this website.'},
 {icon:FiCalendar,title:'Choose dates in MOK',desc:'Check available models, dates and the booking quotation in MOK PWA.'},
 {icon:FiCheckCircle,title:'Complete booking',desc:'Follow the reservation and confirmation steps shown in the app.'}
];
export default function RentalProcess(){
 return <section className="bg-[#1B1D1F] py-20 text-white md:py-24" aria-labelledby="steps-heading">
 <div className="container-custom">
  <p className="mb-3 text-center text-xs font-extrabold uppercase tracking-[.2em] text-[#FF923F]">Simple online journey</p>
  <h2 id="steps-heading" className="mx-auto max-w-2xl text-center text-4xl font-extrabold tracking-tight md:text-5xl">From search to your rental.</h2>
  <div className="mt-12 grid gap-5 md:grid-cols-3">
   {steps.map((step,index)=>{const Icon=step.icon;return <div key={step.title} className="rounded-[22px] border border-white/10 bg-[#292C2E] p-7">
    <div className="mb-7 flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF761A]/15 text-[#FF923F]"><Icon aria-hidden="true" className="h-6 w-6"/></span><span className="text-3xl font-black text-white/20">0{index+1}</span></div>
    <h3 className="text-xl font-bold">{step.title}</h3><p className="mt-3 leading-relaxed text-[#BBC0C3]">{step.desc}</p>
   </div>;})}
  </div>
  <div className="mt-10 text-center"><a href={MOK_BOOKING_URL} className="btn-primary">Continue to MOK Booking</a></div>
 </div></section>;
}
