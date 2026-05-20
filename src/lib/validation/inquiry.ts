export type InquiryCreateInput = {
  carId: string;
  carName: string;
  customerName: string;
  whatsappNumber: string;
  email?: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  notes?: string;
};

export type InquiryRowInsert = {
  car_id: string;
  car_name: string;
  customer_name: string;
  whatsapp_number: string;
  email: string | null;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  notes: string | null;
  status: 'pending';
};

function normalizeString(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}

function normalizeOptionalString(v: unknown) {
  const s = normalizeString(v);
  return s ? s : null;
}

function isValidDateString(v: string) {
  return Boolean(v) && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export function validateInquiryCreateInput(input: any) {
  const carId = normalizeString(input?.carId);
  const carName = normalizeString(input?.carName);
  const customerName = normalizeString(input?.customerName);
  const whatsappNumber = normalizeString(input?.whatsappNumber);
  const email = normalizeOptionalString(input?.email);
  const pickupDate = normalizeString(input?.pickupDate);
  const returnDate = normalizeString(input?.returnDate);
  const pickupLocation = normalizeString(input?.pickupLocation);
  const notes = normalizeOptionalString(input?.notes);

  if (!carId) return { ok: false as const, error: 'carId is required' };
  if (!carName) return { ok: false as const, error: 'carName is required' };
  if (!customerName) return { ok: false as const, error: 'customerName is required' };
  if (!whatsappNumber) return { ok: false as const, error: 'whatsappNumber is required' };
  if (!isValidDateString(pickupDate)) return { ok: false as const, error: 'pickupDate is invalid' };
  if (!isValidDateString(returnDate)) return { ok: false as const, error: 'returnDate is invalid' };
  if (!pickupLocation) return { ok: false as const, error: 'pickupLocation is required' };

  if (customerName.length > 120) return { ok: false as const, error: 'customerName is too long' };
  if (whatsappNumber.length > 40) return { ok: false as const, error: 'whatsappNumber is too long' };
  if (carName.length > 160) return { ok: false as const, error: 'carName is too long' };

  return {
    ok: true as const,
    value: {
      car_id: carId,
      car_name: carName,
      customer_name: customerName,
      whatsapp_number: whatsappNumber,
      email,
      pickup_date: pickupDate,
      return_date: returnDate,
      pickup_location: pickupLocation,
      notes,
      status: 'pending' as const,
    } satisfies InquiryRowInsert,
  };
}

export type InquiryStatus = 'pending' | 'confirmed' | 'cancelled';

export function validateInquiryStatus(input: any) {
  const status = normalizeString(input?.status);
  if (status === 'pending' || status === 'confirmed' || status === 'cancelled') {
    return { ok: true as const, value: status as InquiryStatus };
  }
  return { ok: false as const, error: 'status must be pending|confirmed|cancelled' };
}
