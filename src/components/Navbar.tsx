'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX, FiArrowUpRight } from 'react-icons/fi';
import BookingHandoffLink from '@/components/BookingHandoffLink';

const links = [
  { href:'/', label:'Home' }, { href:'/cars', label:'Vehicles' },
  { href:'/senai-airport-car-rental', label:'Senai Airport' },
  { href:'/toyota-alphard-rental-jb', label:'Alphard' },
  { href:'/faq', label:'FAQ' }, { href:'/contact', label:'Contact' }
];

export default function Navbar() {
  const [open,setOpen] = useState(false);
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#191B1D]/95 text-white backdrop-blur-lg" aria-label="Primary navigation">
      <div className="container-custom flex h-20 items-center justify-between gap-5">
        <Link href="/" aria-label="MOK Car Rental homepage" className="flex items-center gap-3">
          <Image
            src="/brand/mok-logo-2026-transparent.webp"
            alt="MOK Car Rental"
            width={215}
            height={60}
            priority
            className="h-12 w-auto max-w-[192px] object-contain"
          />
        </Link>
        <div className="hidden min-[1100px]:flex items-center gap-6">
          {links.map(({href,label})=><Link key={href} href={href} className="text-sm font-semibold text-gray-200 hover:text-[#FF923F]">{label}</Link>)}
        </div>
        <BookingHandoffLink  className="btn-primary hidden min-[1100px]:inline-flex text-sm">Check Available Cars <FiArrowUpRight aria-hidden="true"/></BookingHandoffLink>
        <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/20 min-[1100px]:hidden"
          aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls="mok-mobile-navigation" onClick={()=>setOpen(x=>!x)}>
          {open?<FiX className="h-6 w-6" aria-hidden="true"/>:<FiMenu className="h-6 w-6" aria-hidden="true"/>}
        </button>
      </div>
      {open&&<div id="mok-mobile-navigation" className="border-t border-white/10 bg-[#191B1D] min-[1100px]:hidden">
        <div className="container-custom flex flex-col gap-1 py-4">
          {links.map(({href,label})=><Link key={href} href={href} onClick={()=>setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-100 hover:bg-white/10">{label}</Link>)}
          <BookingHandoffLink  onClick={()=>setOpen(false)} className="btn-primary mt-2">Check Available Cars <FiArrowUpRight aria-hidden="true"/></BookingHandoffLink>
        </div>
      </div>}
    </nav>
  );
}
