'use client';

import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function LegalContactInfo() {
  const { settings } = useSiteSettings();

  const phone = settings.whatsappNumber ? settings.whatsappNumber : '';
  const email = settings.email ? settings.email : '';
  const address = settings.address ? settings.address : '';

  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Contact</h2>
      <div className="space-y-2 text-gray-600">
        {settings.businessName && <p>{settings.businessName}</p>}
        {address && <p>{address}</p>}
        {phone && <p>WhatsApp: {phone}</p>}
        {email && <p>Email: {email}</p>}
      </div>
    </div>
  );
}

