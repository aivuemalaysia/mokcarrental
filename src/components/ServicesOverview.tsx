import Link from 'next/link';
import { FiArrowUpRight, FiMapPin, FiUsers, FiBriefcase, FiNavigation } from 'react-icons/fi';

const services=[
 {title:'Toyota Alphard & Premium MPVs',desc:'Compare a premium option for family, group and business travel in Johor Bahru.',href:'/toyota-alphard-rental-jb',icon:FiUsers},
 {title:'Senai Airport Car Rental',desc:'Plan arrival and handover details before travelling through Senai Airport.',href:'/senai-airport-car-rental',icon:FiNavigation},
 {title:'Economy & Family Vehicles',desc:'Explore vehicle types before checking current cars and dates in the booking app.',href:'/cars',icon:FiMapPin},
 {title:'Business & Longer Stays',desc:'Ask about rental arrangements for work trips and extended visits.',href:'/contact',icon:FiBriefcase},
];

export default function ServicesOverview(){
 return <section id="rental-services" aria-labelledby="services-heading" className="scroll-mt-24 bg-[#F7F7F5] py-20 md:py-24">
  <div className="container-custom">
   <p className="mb-3 text-xs font-extrabold uppercase tracking-[.2em] text-[#CE5205]">Rental options for your journey</p>
   <h2 id="services-heading" className="section-title">Find the right rental in JB.</h2>
   <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[#565D62]">Explore car types, airport guidance and travel considerations. All bookings are completed in MOK PWA.</p>
   <div className="grid gap-5 md:grid-cols-2">
    {services.map(({title,desc,href,icon:Icon},index)=><Link href={href} key={href} className="group rounded-[24px] border border-[#DDE0E2] bg-white p-7 transition-colors hover:border-[#FF761A] hover:bg-[#FFF9F5] md:p-9">
      <div className="mb-7 flex items-center justify-between">
       <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0E4] text-[#D95706]"><Icon aria-hidden="true" className="h-6 w-6"/></span>
       <span className="text-xs font-bold tracking-widest text-[#92979A]">0{index+1}</span>
      </div>
      <h3 className="text-2xl font-extrabold tracking-tight text-[#191B1D]">{title}</h3>
      <p className="mt-3 max-w-lg leading-relaxed text-[#5A6267]">{desc}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#B94B06]">Explore guide <FiArrowUpRight aria-hidden="true"/></span>
    </Link>)}
   </div>
  </div>
 </section>;
}
