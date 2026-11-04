import Link from 'next/link';
export default function SEODynamicContent(){
 return <section className="bg-white py-20 md:py-24" aria-labelledby="jb-rental-guide">
 <div className="container-custom grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
  <article className="max-w-3xl space-y-6 leading-[1.8] text-[#51585C]">
   <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#C45109]">Local rental information</p>
   <h2 id="jb-rental-guide" className="text-3xl font-extrabold tracking-tight text-[#17191B] md:text-4xl">Planning car rental in Johor Bahru?</h2>
   <p>Johor Bahru is a starting point for city visits, family trips and journeys across Johor. Renting a car can give your group flexibility, but the best vehicle depends on passenger count, luggage, intended route and rental duration. MOK provides vehicle information and an online booking app for checking current options.</p>
   <h3 className="text-2xl font-bold text-[#1B1D1F]">Choosing a car for your trip</h3>
   <p>Economy cars can suit shorter city visits, while multi-purpose vehicles (MPVs) may be useful for groups with more passengers and bags. For premium MPV considerations, read the <Link href="/toyota-alphard-rental-jb" className="font-semibold text-[#B94B06] underline">Toyota Alphard rental guide</Link>. Compare <Link href="/cars" className="font-semibold text-[#B94B06] underline">vehicle types</Link> before moving to MOK PWA for actual availability and rental quotations.</p>
   <h3 className="text-2xl font-bold text-[#1B1D1F]">Travelling through Senai Airport</h3>
   <p>For flights arriving at Senai International Airport (JHB), plan time for luggage collection and travel to your confirmed vehicle handover point. Read our <Link href="/senai-airport-car-rental" className="font-semibold text-[#B94B06] underline">Senai Airport rental guide</Link> and ask the team to confirm whether airport delivery can be arranged and any fee that applies.</p>
   <h3 className="text-2xl font-bold text-[#1B1D1F]">Coming from Singapore?</h3>
   <p>Visitors arriving via the Causeway or Second Link should confirm the pickup location, identification, licence requirements and intended travel route. Do not assume a rental car may cross the international border. Rental policies, deposits and cancellations should be confirmed before you travel.</p>
   <p>Explore our <Link href="/faq" className="font-semibold text-[#B94B06] underline">rental FAQs</Link> or <Link href="/contact" className="font-semibold text-[#B94B06] underline">contact MOK</Link> with a question about your trip.</p>
  </article>
  <aside className="h-fit rounded-3xl border border-[#E0E3E4] bg-[#F7F7F5] p-7">
   <h3 className="text-xl font-extrabold text-[#191B1D]">Explore MOK guides</h3>
   <div className="mt-5 flex flex-col gap-3 text-sm font-semibold text-[#B94B06]">
    <Link href="/cars">Vehicle information</Link>
    <Link href="/toyota-alphard-rental-jb">Alphard rental in JB</Link>
    <Link href="/senai-airport-car-rental">Senai Airport rental</Link>
    <Link href="/faq">Rental FAQs</Link>
    <Link href="/contact">Ask our team</Link>
   </div>
   <p className="mt-6 border-t border-[#DEE1E2] pt-5 text-sm leading-relaxed text-[#596166]">This website provides general information. Confirm live availability, prices and booking conditions in MOK PWA.</p>
  </aside>
 </div></section>;
}
