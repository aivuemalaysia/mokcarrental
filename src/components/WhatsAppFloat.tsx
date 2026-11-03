'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { useSiteSettings } from '@/hooks/useSiteSettings';

// Direct support chat. New reservations must use the MOK PWA booking flow.
export default function WhatsAppFloat() {
  const { getWhatsAppLink } = useSiteSettings();
  const url = getWhatsAppLink('Hello MOK Car Rental, I have a question about your rental service.');
  const href = url === '#' ? '/contact' : url;

  return (
    <a
      href={href}
      target={url === '#' ? undefined : '_blank'}
      rel={url === '#' ? undefined : 'noopener noreferrer'}
      className="whatsapp-float animate-bounce-slow"
      aria-label="Chat with MOK support on WhatsApp"
    >
      <div className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110">
        <FaWhatsapp className="w-8 h-8" />
      </div>
    </a>
  );
}
