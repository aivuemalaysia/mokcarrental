'use client';

import { useSiteSettings } from '@/hooks/useSiteSettings';

// WhatsApp is for customer support; the website's booking CTAs go to MOK PWA.
export default function WhatsAppInquiryButton({
  label,
  className,
  prefillCar,
}: {
  label: string;
  className: string;
  prefillCar?: { id?: string; name?: string };
}) {
  const { getWhatsAppLink } = useSiteSettings();
  const message = prefillCar?.name
    ? `Hello MOK Car Rental, I have a question about the ${prefillCar.name}.`
    : 'Hello MOK Car Rental, I have a question about your rental service.';
  const url = getWhatsAppLink(message);
  return (
    <a
      href={url === '#' ? '/contact' : url}
      target={url === '#' ? undefined : '_blank'}
      rel={url === '#' ? undefined : 'noopener noreferrer'}
      className={className}
    >
      {label}
    </a>
  );
}
