import type { Metadata } from 'next';
import Link from 'next/link';
import LegalContactInfo from '@/components/LegalContactInfo';

export const metadata: Metadata = {
  title: 'Privacy Information',
  description: 'Learn how MOK Car Rental handles enquiries on the Johor Bahru marketing website, and where to review booking and document-handling information in MOK PWA.',
  alternates: { canonical: '/privacy' },
};

const bookingTermsUrl = 'https://app.mokcarrental.com/terms';

export default function PrivacyPage() {
  return (
    <main className="pt-20">
      <section className="bg-[#1B1D1F] py-20 text-white">
        <div className="container-custom max-w-5xl">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF923F]">MOK Car Rental</p>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Privacy Information</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#CFD4D6]">
            Information about enquiries sent through this marketing website and the separate MOK booking app.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container-custom max-w-4xl">
          <div className="rounded-3xl border border-[#E2E5E7] bg-[#F7F7F5] p-7 md:p-9">
            <h2 className="text-2xl font-bold text-[#1B1D1F]">Two separate customer experiences</h2>
            <p className="mt-4 leading-relaxed text-[#4D565C]">
              This website provides general rental information and an enquiry form. New vehicle bookings,
              rental quotations, identification steps and payments are handled through MOK PWA,
              not through this marketing website.
            </p>
            <a href={bookingTermsUrl}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FF761A] px-6 py-3 font-bold text-[#17191B] hover:bg-[#FF923F]">
              Review MOK PWA booking terms
            </a>
          </div>

          <div className="mt-12 space-y-9 leading-relaxed text-[#4D565C]">
            <section aria-labelledby="enquiry-data">
              <h2 id="enquiry-data" className="text-2xl font-bold text-[#1B1D1F]">Website enquiries</h2>
              <p className="mt-3">
                If you choose to contact MOK through the website, the information you submit may include
                your name, contact details and enquiry message. This information is used to handle the
                enquiry and respond to you. Please do not enter passwords, payment card numbers or
                identity-document images into a general enquiry.
              </p>
            </section>
            <section aria-labelledby="booking-information">
              <h2 id="booking-information" className="text-2xl font-bold text-[#1B1D1F]">Booking and driver documents</h2>
              <p className="mt-3">
                For a new rental, continue to the MOK booking app. Review the information presented there
                before submitting identification, driving-licence or payment details. The booking app
                operates separately from the marketing website, and its current terms explain
                booking-related information and document handling.
              </p>
            </section>
            <section aria-labelledby="website-operation">
              <h2 id="website-operation" className="text-2xl font-bold text-[#1B1D1F]">Website operation and third-party services</h2>
              <p className="mt-3">
                Website hosting and support services may process technical information needed to
                deliver and protect the site, such as request data and browser information.
                Links to WhatsApp or MOK PWA take you to their respective services. Please consider
                the information you share before using external links.
              </p>
            </section>
            <section aria-labelledby="privacy-requests">
              <h2 id="privacy-requests" className="text-2xl font-bold text-[#1B1D1F]">Privacy enquiries and requests</h2>
              <p className="mt-3">
                To ask how your information is used, request a correction, or enquire about retention,
                deletion or marketing preferences, contact MOK using the details below. Requests are
                handled subject to applicable legal and operational requirements.
              </p>
              <div className="mt-5"><Link href="/contact" className="btn-secondary">Contact MOK</Link></div>
            </section>
          </div>
          <LegalContactInfo/>
        </div>
      </section>
    </main>
  );
}
