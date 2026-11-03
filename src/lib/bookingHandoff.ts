/**
 * Marketing site -> booking PWA handoff.
 *
 * Keep legacy website car IDs out of booking URLs: website 'cars' and
 * PWA 'vehicle_models' use different identifiers. Customers select the
 * live model and dates on the PWA, which is the booking source of truth.
 */
export const MOK_BOOKING_URL =
  'https://app.mokcarrental.com/cars?utm_source=mokcarrental.com&utm_medium=website&utm_campaign=booking_handoff';
