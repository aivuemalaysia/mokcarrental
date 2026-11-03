import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import ServicesOverview from '@/components/ServicesOverview';
import RentalProcess from '@/components/RentalProcess';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';
import SEODynamicContent from '@/components/SEODynamicContent';
import { canonicalFor } from '@/lib/seo';

export const metadata: Metadata = {
 title: 'Car Rental Johor Bahru (JB) | MOK Car Rental',
 description: 'Explore car rental in Johor Bahru with MOK. Read about Alphard and MPV rentals, Senai Airport and local travel before checking live vehicle availability online.',
 alternates: {canonical:canonicalFor('/')},
 openGraph: {title:'Car Rental Johor Bahru | MOK Car Rental',url:canonicalFor('/'),description:'Johor Bahru car rental information and online booking with MOK.'}
};
export default function Home(){
 return <main><Hero/><ServicesOverview/><RentalProcess/><SEODynamicContent/><FAQ/><CTASection/></main>;
}
