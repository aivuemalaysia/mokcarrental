'use client';

import { useWhatsAppInquiry } from '@/components/WhatsAppInquiryProvider';

export default function WhatsAppInquiryButton({
  label,
  className,
  prefillCar,
}: {
  label: string;
  className: string;
  prefillCar?: { id?: string; name?: string };
}) {
  const { openInquiry } = useWhatsAppInquiry();

  return (
    <button type="button" onClick={() => openInquiry(prefillCar)} className={className}>
      {label}
    </button>
  );
}

