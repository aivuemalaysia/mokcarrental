import type { Metadata } from 'next';
import Link from 'next/link';
import LegalContactInfo from '@/components/LegalContactInfo';

const pwaTermsUrl = 'https://app.mokcarrental.com/terms';

export const metadata: Metadata = {
  title: 'Rental Terms & Conditions',
  description: 'Understand where to review current MOK rental terms, eligibility, deposit, payment and cancellation details before completing a Johor Bahru car rental booking.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="pt-20">
      <section className="bg-[#1B1D1F] py-20 text-white">
        <div className="container-custom max-w-5xl">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF923F]">Rental information</p>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Rental Terms &amp; Conditions</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#CFD4D6]">
            Please review the current rental requirements and booking conditions before confirming a car in Johor Bahru.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container-custom max-w-4xl">
          <div className="rounded-3xl border border-[#F7C5A1] bg-[#FFF6EF] p-7 md:p-9">
            <h2 className="text-2xl font-bold text-[#1B1D1F]">Online bookings are handled in MOK PWA</h2>
            <p className="mt-4 leading-relaxed text-[#565D62]">
              This website provides car rental information, but does not accept or process new bookings.
              Before confirming a reservation, read the terms presented in the MOK booking app and the
              conditions applicable to your chosen vehicle, dates and rental quotation.
            </p>
            <a
              href={pwaTermsUrl}
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FF761A] px-6 py-3 font-bold text-[#17191B] hover:bg-[#FF923F]"
            >
              Review MOK booking terms
            </a>
          </div>

          <div className="mt-12 space-y-8 leading-relaxed text-[#4D565C]">
            <div>
              <h2 className="text-2xl font-bold text-[#1B1D1F]">Check the conditions for your booking</h2>
              <p className="mt-3">
                Requirements and charges may depend on the vehicle and booking details. Please review the
                following before confirming a rental: driver eligibility and documentation, rental duration,
                pickup and return arrangements, mileage and fuel conditions, security deposit, payment,
                cancellation or refund arrangements, and possible damage or late-return charges.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1B1D1F]">Prices, deposits and optional services</h2>
              <p className="mt-3">
                Information and historic vehicle profiles on this marketing site are not a guarantee of
                availability or a final rental quotation. Use MOK PWA to check current options and
                review the price breakdown and applicable conditions before proceeding with payment.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1B1D1F]">Questions or an older website inquiry?</h2>
              <p className="mt-3">
                For questions about rental requirements, a booking or an inquiry submitted through the previous
                website, contact MOK support. The marketing website no longer offers a public booking lookup.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="btn-secondary" href="/contact">Contact MOK</Link>
                <Link className="btn-secondary" href="/booking">Go to online booking</Link>
              </div>
            </div>
          </div>
          <LegalContactInfo />
        </div>
      </section>
    </div>
  );
}
