import type { Metadata } from 'next';
import Link from 'next/link';
import LegalContactInfo from '@/components/LegalContactInfo';
import { MOK_REGISTERED_COMPANY_NAME, MOK_PRIVACY_CONTACT_EMAIL } from '@/lib/legalIdentity';

const bookingTermsUrl = 'https://app.mokcarrental.com/terms';
const privacySections = {
  "en": [
    {
      "title": "1. Controller and scope",
      "paragraphs": [
        "Mok Car Group (M) Sdn Bhd, operating under the MOK Car Rental brand, is identified in this notice as the company responsible for enquiries submitted on www.mokcarrental.com. This notice covers the information website and its contact form, not the separate booking app.",
        "For questions about this notice or personal information held in relation to a website enquiry, use the privacy email shown below."
      ]
    },
    {
      "title": "2. Information we collect and its source",
      "paragraphs": [
        "When you submit an enquiry, you provide your name, email address, telephone or WhatsApp number, and message. We receive these details directly from you.",
        "The website and its service providers may also process technical request information, including IP address, browser/device information and timestamps, to deliver and protect the site and limit abusive submissions. Please do not submit identity cards, driving licence images, payment card numbers or passwords in the general enquiry form."
      ]
    },
    {
      "title": "3. Why we process information",
      "paragraphs": [
        "We use enquiry details to receive and respond to questions, contact you about your request, keep operational records of enquiries, protect the service against abuse, and satisfy applicable legal obligations.",
        "The enquiry form is not a promotional subscription form. If we offer separate promotional communications, their preferences and applicable permissions must be handled separately."
      ]
    },
    {
      "title": "4. Required information and your choices",
      "paragraphs": [
        "The online enquiry form requires a name, email address, phone number and message so our team can handle the request. If you do not supply these fields, the form cannot be submitted. You may instead contact us using the displayed alternative channels; the privacy practices of an external messaging provider also apply when you use it."
      ]
    },
    {
      "title": "5. People and services that may receive information",
      "paragraphs": [
        "Authorised MOK team members handling enquiries may access contact records. Website operations use hosting, database and email-delivery services, including Vercel, Supabase and Resend (where email notifications are configured). These service providers may process information on our behalf to deliver the relevant service.",
        "We may also disclose information where required by applicable law or a lawful request. We do not ask visitors to enter driver documents through the website enquiry form."
      ]
    },
    {
      "title": "6. Processing outside Malaysia",
      "paragraphs": [
        "The website database is currently hosted in Australia. Other infrastructure and communication providers may also process information outside Malaysia. Cross-border handling must be assessed and carried out in accordance with the requirements applicable under Malaysian personal data protection law."
      ]
    },
    {
      "title": "7. Protection and retention",
      "paragraphs": [
        "We use access restrictions and technical safeguards intended to protect information used to run the website. No internet service can guarantee absolute security.",
        "Enquiry information is kept for operational and applicable legal needs. The precise record-retention and deletion schedule remains subject to the company's final internal review. You may contact us to ask about a specific record or request appropriate action."
      ]
    },
    {
      "title": "8. Your requests and rights",
      "paragraphs": [
        "You may contact us to request access to or correction of personal data, enquire about its use, recipients and retention, or ask us to review deletion and any relevant consent or marketing preferences. We will assess requests according to applicable law and verification requirements.",
        "Send privacy requests to the email address displayed below. You may also raise privacy concerns with Malaysia's Personal Data Protection Commissioner when appropriate."
      ]
    },
    {
      "title": "9. Booking in MOK PWA and external links",
      "paragraphs": [
        "New vehicle bookings, identity verification, driving licence details, payment and booking records are handled in the separate MOK booking app at app.mokcarrental.com. Review the information and conditions provided there before entering booking or identity details.",
        "External links, including WhatsApp, are operated by their respective providers and may have their own notices."
      ]
    },
    {
      "title": "10. Updates",
      "paragraphs": [
        "This notice may be updated as the website's practices or legal requirements change. Version date: 4 November 2026."
      ]
    }
  ],
  "ms": [
    {
      "title": "1. Pengawal data dan skop",
      "paragraphs": [
        "Mok Car Group (M) Sdn Bhd, yang menjalankan perniagaan di bawah jenama MOK Car Rental, dikenal pasti dalam notis ini sebagai syarikat yang bertanggungjawab terhadap pertanyaan yang dihantar melalui www.mokcarrental.com. Notis ini meliputi laman maklumat dan borang hubungan, bukan aplikasi tempahan yang berasingan.",
        "Untuk pertanyaan mengenai notis ini atau data peribadi berkaitan pertanyaan laman web, sila gunakan alamat e-mel privasi yang dinyatakan di bawah."
      ]
    },
    {
      "title": "2. Data yang dikumpulkan dan sumbernya",
      "paragraphs": [
        "Apabila anda menghantar pertanyaan, anda memberikan nama, alamat e-mel, nombor telefon atau WhatsApp, dan mesej anda. Maklumat ini diterima terus daripada anda.",
        "Laman web dan penyedia perkhidmatannya juga mungkin memproses maklumat teknikal permintaan seperti alamat IP, maklumat pelayar/peranti dan masa akses untuk mengendalikan dan melindungi laman serta mengehadkan penghantaran yang menyalahgunakan sistem. Jangan sertakan gambar kad pengenalan, lesen memandu, nombor kad pembayaran atau kata laluan dalam borang pertanyaan umum."
      ]
    },
    {
      "title": "3. Tujuan pemprosesan",
      "paragraphs": [
        "Kami menggunakan maklumat pertanyaan untuk menerima dan menjawab soalan, menghubungi anda berhubung permintaan anda, menyimpan rekod operasi pertanyaan, melindungi perkhidmatan daripada penyalahgunaan dan memenuhi kewajipan undang-undang yang berkenaan.",
        "Borang pertanyaan ini bukan borang langganan promosi. Sekiranya komunikasi promosi ditawarkan secara berasingan, pilihan dan kebenaran yang berkaitan perlu diuruskan secara berasingan."
      ]
    },
    {
      "title": "4. Maklumat wajib dan pilihan anda",
      "paragraphs": [
        "Borang pertanyaan dalam talian memerlukan nama, alamat e-mel, nombor telefon dan mesej supaya pasukan kami dapat menguruskan permintaan anda. Jika maklumat wajib tidak diberikan, borang tidak dapat dihantar. Anda boleh menggunakan saluran hubungan alternatif yang dipaparkan; dasar privasi penyedia aplikasi pemesejan luar juga terpakai apabila anda menggunakannya."
      ]
    },
    {
      "title": "5. Penerima maklumat dan penyedia perkhidmatan",
      "paragraphs": [
        "Ahli pasukan MOK yang dibenarkan menguruskan pertanyaan mungkin mengakses rekod hubungan. Operasi laman web menggunakan perkhidmatan pengehosan, pangkalan data dan penghantaran e-mel, termasuk Vercel, Supabase dan Resend (apabila pemberitahuan e-mel dikonfigurasikan). Penyedia tersebut mungkin memproses maklumat bagi pihak kami untuk menyediakan perkhidmatan berkaitan.",
        "Kami juga mungkin mendedahkan maklumat apabila dikehendaki oleh undang-undang yang terpakai atau permintaan yang sah. Kami tidak meminta dokumen pemandu melalui borang pertanyaan laman web."
      ]
    },
    {
      "title": "6. Pemprosesan di luar Malaysia",
      "paragraphs": [
        "Pangkalan data laman web pada masa ini dihoskan di Australia. Penyedia infrastruktur dan komunikasi lain juga mungkin memproses maklumat di luar Malaysia. Sebarang pemprosesan rentas sempadan perlu dinilai dan dilaksanakan mengikut keperluan undang-undang perlindungan data peribadi Malaysia yang berkenaan."
      ]
    },
    {
      "title": "7. Keselamatan dan tempoh penyimpanan",
      "paragraphs": [
        "Kami menggunakan sekatan akses dan langkah perlindungan teknikal yang bertujuan melindungi maklumat untuk operasi laman web. Tiada perkhidmatan internet dapat menjamin keselamatan sepenuhnya.",
        "Maklumat pertanyaan disimpan bagi keperluan operasi dan undang-undang yang berkenaan. Tempoh penyimpanan khusus dan prosedur pemadaman masih tertakluk kepada semakan dalaman akhir syarikat. Anda boleh menghubungi kami untuk bertanya tentang rekod tertentu atau meminta tindakan yang sewajarnya."
      ]
    },
    {
      "title": "8. Permintaan dan hak anda",
      "paragraphs": [
        "Anda boleh menghubungi kami untuk memohon akses kepada atau pembetulan data peribadi, bertanya tentang penggunaan, penerima dan penyimpanannya, atau meminta semakan terhadap pemadaman serta pilihan persetujuan atau pemasaran yang berkenaan. Permintaan akan dinilai mengikut undang-undang dan keperluan pengesahan yang terpakai.",
        "Hantarkan permintaan berkaitan privasi ke alamat e-mel di bawah. Jika bersesuaian, anda juga boleh mengemukakan aduan kepada Pesuruhjaya Perlindungan Data Peribadi Malaysia."
      ]
    },
    {
      "title": "9. Tempahan melalui MOK PWA dan pautan luar",
      "paragraphs": [
        "Tempahan kenderaan baharu, pengesahan identiti, maklumat lesen memandu, pembayaran dan rekod tempahan diuruskan melalui aplikasi tempahan MOK yang berasingan di app.mokcarrental.com. Sila semak maklumat dan syarat yang dipaparkan di sana sebelum memasukkan maklumat tempahan atau identiti.",
        "Pautan luar, termasuk WhatsApp, dikendalikan oleh penyedia masing-masing dan mungkin mempunyai notis privasi tersendiri."
      ]
    },
    {
      "title": "10. Perubahan notis",
      "paragraphs": [
        "Notis ini mungkin dikemas kini apabila amalan laman web atau keperluan undang-undang berubah. Tarikh versi: 4 November 2026."
      ]
    }
  ]
} as const;

export const metadata: Metadata = {
  title: 'Privacy Notice / Notis Privasi',
  description: 'Bilingual English and Bahasa Malaysia privacy information for enquiries on the MOK Car Rental website, including personal data, recipients, overseas processing and rights.',
  alternates: { canonical: '/privacy' },
};

function PrivacyLanguage({ language }: { language: 'en' | 'ms' }) {
  const isMalay = language === 'ms';
  const sections = privacySections[language];
  return (
    <article
      id={isMalay ? 'notis-privasi' : 'privacy-notice'}
      lang={language}
      className="scroll-mt-24 rounded-2xl border border-[#E2E5E7] bg-white p-6 md:p-10"
      aria-label={isMalay ? 'Notis Privasi Bahasa Malaysia' : 'Privacy Notice English'}
    >
      <h2 className="text-2xl font-extrabold text-[#1B1D1F]">
        {isMalay ? 'Notis Privasi (Bahasa Malaysia)' : 'Privacy Notice (English)'}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-[#4D565C]">
        {isMalay ? 'Nama syarikat berdaftar / pengawal data:' : 'Registered company / data controller:'}{' '}
        <strong className="text-[#1B1D1F]">{MOK_REGISTERED_COMPANY_NAME}</strong>
      </p>
      <div className="mt-8 space-y-8">
        {sections.map((section, index) => (
          <section key={index} className="space-y-3">
            <h3 className="text-lg font-bold text-[#1B1D1F]">{section.title}</h3>
            {section.paragraphs.map((paragraph, pIndex) => (
              <p key={pIndex} className="leading-relaxed text-[#4D565C]">{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
      <div className="mt-10 rounded-xl bg-[#FFF6EF] p-5">
        <p className="font-semibold text-[#1B1D1F]">
          {isMalay ? 'Hubungan privasi / E-mel' : 'Privacy contact / Email'}
        </p>
        <a className="mt-1 inline-block font-medium text-[#B95112] underline break-all"
          href={'mailto:' + MOK_PRIVACY_CONTACT_EMAIL}>{MOK_PRIVACY_CONTACT_EMAIL}</a>
      </div>
    </article>
  );
}

export default function PrivacyPage() {
  return (
    <main className="pt-20">
      <section className="bg-[#1B1D1F] py-16 md:py-20 text-white">
        <div className="container-custom max-w-5xl">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[#FF923F]">MOK Car Rental</p>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Privacy Notice / Notis Privasi</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#CFD4D6]">
            Information on website enquiries and personal data / Maklumat pertanyaan laman web dan data peribadi
          </p>
          <p className="mt-4 text-sm text-[#CFD4D6]">
            {MOK_REGISTERED_COMPANY_NAME}
          </p>
          <nav aria-label="Privacy notice languages / Bahasa notis privasi" className="mt-8 flex flex-wrap gap-3">
            <a href="#privacy-notice" className="rounded-lg bg-[#FF761A] px-5 py-3 font-semibold text-[#17191B]">English</a>
            <a href="#notis-privasi" className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white">Bahasa Malaysia</a>
          </nav>
        </div>
      </section>
      <div className="bg-[#F5F5F2] py-14 md:py-20">
        <div className="container-custom max-w-5xl space-y-8">
          <div className="rounded-2xl border border-[#F7C5A1] bg-[#FFF6EF] p-6 md:p-8">
            <h2 className="text-xl font-bold text-[#1B1D1F]">Website enquiries / Pertanyaan laman web</h2>
            <p className="mt-3 text-[#4D565C]">
              This website answers general enquiries. New bookings, identity documents and payments belong in the separate MOK PWA booking app.
            </p>
            <p lang="ms" className="mt-3 text-[#4D565C]">
              Laman ini menerima pertanyaan umum. Tempahan baharu, dokumen pengenalan dan pembayaran dikendalikan oleh aplikasi MOK PWA yang berasingan.
            </p>
            <a href={bookingTermsUrl} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#FF761A] px-5 py-3 font-bold text-[#17191B] hover:bg-[#FF923F]">
              MOK PWA booking terms / Syarat tempahan
            </a>
          </div>
          <PrivacyLanguage language="en" />
          <PrivacyLanguage language="ms" />
          <div className="rounded-2xl border border-[#E2E5E7] bg-white p-6">
            <Link href="/contact" className="font-semibold text-[#B95112] underline">Contact MOK / Hubungi MOK</Link>
            <LegalContactInfo />
          </div>
        </div>
      </div>
    </main>
  );
}
