import { buildWhatsAppInquiryMessage, buildWhatsAppUrl } from '@/components/WhatsAppInquiryProvider';

describe('WhatsApp inquiry helpers', () => {
  test('buildWhatsAppInquiryMessage matches required format', () => {
    const message = buildWhatsAppInquiryMessage({
      businessName: 'Mok Car Rental',
      form: {
        name: 'Irene',
        phone: '+60 11-3322 3351',
        carInterested: 'Toyota Alphard',
        pickupDate: '2026-06-01',
        returnDate: '2026-06-03',
        pickupLocation: 'Senai Airport',
        extraNote: 'Need child seat',
      },
    });

    expect(message).toBe(`Hello Mok Car Rental, I would like to inquire about car rental.

Name: Irene
Phone: +60 11-3322 3351
Car Interested: Toyota Alphard
Pickup Date: 2026-06-01
Return Date: 2026-06-03
Pickup Location: Senai Airport
Extra Note: Need child seat

Please help me check availability and price. Thank you.`);
  });

  test('buildWhatsAppUrl encodes and sanitizes number', () => {
    const message = 'Hello Mok Car Rental, test message';
    const url = buildWhatsAppUrl({
      whatsappNumber: '+60 11-3322 3351',
      message,
    });

    expect(url).toBe(`https://wa.me/601133223351?text=${encodeURIComponent(message)}`);
  });
});
