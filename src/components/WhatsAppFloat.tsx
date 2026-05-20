'use client';

import { FaWhatsapp } from 'react-icons/fa';
import { useWhatsAppInquiry } from '@/components/WhatsAppInquiryProvider';

export default function WhatsAppFloat() {
  const { openInquiry } = useWhatsAppInquiry();
  
  return (
    <button
      type="button"
      onClick={() => openInquiry()}
      className="whatsapp-float animate-bounce-slow"
      aria-label="Chat on WhatsApp"
    >
      <div className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110">
        <FaWhatsapp className="w-8 h-8" />
      </div>
    </button>
  );
}
