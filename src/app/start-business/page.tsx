'use client';

import StartBusinessOnboarding from '@/components/StartBusinessOnboarding';

export default function StartBusinessPage() {
  return (
    <div className="pt-20">
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Partner With Us</h1>
          <p className="text-lg text-gray-200 max-w-2xl">
            Submit your details and car photos. After admin approval, our team will list your cars on the platform.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <StartBusinessOnboarding />
        </div>
      </section>
    </div>
  );
}

