'use client';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowUpRight, FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import BookingHandoffLink from '@/components/BookingHandoffLink';
import { MOK_REGISTERED_COMPANY_NAME } from '@/lib/legalIdentity';
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
   <div><Link href="/" className="inline-flex items-center gap-3" aria-label="MOK Car Rental homepage"><Image
      src="/brand/mok-logo-2026-transparent.webp"
      alt="MOK Car Rental"
      width={236}
      height={66}
      className="h-[58px] w-auto max-w-[225px] object-contain"
    /></Link>
    <p className="mt-5 max-w-sm leading-relaxed text-[#BBC0C3]">Car rental information and online booking for Johor Bahru, Malaysia. Explore options and plan your journey with MOK.</p>
    <BookingHandoffLink  className="mt-6 inline-flex items-center gap-2 font-bold text-[#FF923F] hover:underline">Check available cars <FiArrowUpRight aria-hidden="true"/></BookingHandoffLink>
   </div>
   <div><h2 className="mb-5 font-bold">Rental information</h2><div className="flex flex-col gap-3 text-sm text-[#C3C8CB]">{guides.map(x=><Link key={x.href} href={x.href} className="hover:text-[#FF923F]">{x.label}</Link>)}</div></div>
   <div><h2 className="mb-5 font-bold">MOK Car Rental</h2><div className="flex flex-col gap-3 text-sm text-[#C3C8CB]">
    <Link href="/about" className="hover:text-[#FF923F]">About MOK</Link><Link href="/contact" className="hover:text-[#FF923F]">Contact</Link><Link href="/start-business" className="hover:text-[#FF923F]">Business enquiries</Link>
    <span className="mt-2 flex items-center gap-2"><FiMapPin aria-hidden="true" className="text-[#FF923F]"/>{settings.address||'Johor Bahru, Johor, Malaysia'}</span>
    {validPhone&&<a href={`tel:${settings.whatsappNumber.replace(/\s/g,'')}`} className="flex items-center gap-2 hover:text-[#FF923F]"><FiPhone aria-hidden="true"/>{settings.whatsappNumber}</a>}
    {validEmail&&<a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-[#FF923F]"><FiMail aria-hidden="true"/>{settings.email}</a>}
   </div></div>
  </div>
  <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-8 text-xs text-[#9FA7AB] md:flex-row md:justify-between">
   <div className="space-y-1"><p>© {new Date().getFullYear()} MOK Car Rental. All rights reserved.</p><p>Registered company / Syarikat berdaftar: {MOK_REGISTERED_COMPANY_NAME}</p></div>
   <div className="flex flex-wrap gap-6"><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/my-bookings">Past website enquiries</Link></div>
  </div>
 </div></footer>;
}
