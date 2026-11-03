'use client';
import Link from 'next/link';
import { FiArrowUpRight, FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { MOK_BOOKING_URL } from '@/lib/bookingHandoff';
const guides=[
 {href:'/cars',label:'Vehicles & rental types'},
 {href:'/toyota-alphard-rental-jb',label:'Toyota Alphard in JB'},
 {href:'/senai-airport-car-rental',label:'Senai Airport rental'},
 {href:'/faq',label:'Rental FAQ'}
];
export default function Footer(){
 const {settings}=useSiteSettings(),phone=settings.whatsappNumber.replace(/[^0-9]/g,'');
 const validPhone=phone.length>=9&&phone.length<=15,validEmail=settings.email.includes('@');
 return <footer className="bg-[#151719] py-16 text-white"><div className="container-custom">
  <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
   <div><Link href="/" className="inline-flex items-center gap-3" aria-label="MOK Car Rental homepage"><span className="text-4xl font-black tracking-[-.12em] text-[#FF761A]">MOK</span><span className="border-l border-white/20 pl-3 text-xs font-bold uppercase tracking-widest">Car Rental</span></Link>
    <p className="mt-5 max-w-sm leading-relaxed text-[#BBC0C3]">Car rental information and online booking for Johor Bahru, Malaysia. Explore options and plan your journey with MOK.</p>
    <a href={MOK_BOOKING_URL} className="mt-6 inline-flex items-center gap-2 font-bold text-[#FF923F] hover:underline">Check available cars <FiArrowUpRight aria-hidden="true"/></a>
   </div>
   <div><h2 className="mb-5 font-bold">Rental information</h2><div className="flex flex-col gap-3 text-sm text-[#C3C8CB]">{guides.map(x=><Link key={x.href} href={x.href} className="hover:text-[#FF923F]">{x.label}</Link>)}</div></div>
   <div><h2 className="mb-5 font-bold">MOK Car Rental</h2><div className="flex flex-col gap-3 text-sm text-[#C3C8CB]">
    <Link href="/about" className="hover:text-[#FF923F]">About MOK</Link><Link href="/contact" className="hover:text-[#FF923F]">Contact</Link><Link href="/start-business" className="hover:text-[#FF923F]">Business enquiries</Link>
    <span className="mt-2 flex items-center gap-2"><FiMapPin aria-hidden="true" className="text-[#FF923F]"/>{settings.address||'Johor Bahru, Johor, Malaysia'}</span>
    {validPhone&&<a href={`tel:+${phone}`} className="flex items-center gap-2 hover:text-[#FF923F]"><FiPhone aria-hidden="true"/>{settings.whatsappNumber}</a>}
    {validEmail&&<a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-[#FF923F]"><FiMail aria-hidden="true"/>{settings.email}</a>}
   </div></div>
  </div>
  <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-8 text-xs text-[#9FA7AB] md:flex-row md:justify-between">
   <p>© {new Date().getFullYear()} MOK Car Rental. All rights reserved.</p>
   <div className="flex flex-wrap gap-6"><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/my-bookings">Past website enquiries</Link></div>
  </div>
 </div></footer>;
}
