/**
 * Marketing site -> booking PWA handoff.
 *
 * Keep legacy website car IDs out of booking URLs: website 'cars' and
 * PWA 'vehicle_models' use different identifiers. Customers select the
 * live model and dates on the PWA, which is the booking source of truth.
 *
 * The existing attribution fields must remain stable; utm_content records
 * only the marketing page pathname, never query parameters or personal data.
 */
const HANDOFF_URL =
  'https://app.mokcarrental.com/cars?utm_source=mokcarrental.com&utm_medium=website&utm_campaign=booking_handoff';

export function bookingUrlForPath(pathname: string): string {
  const destination = new URL(HANDOFF_URL);
  // Do not pass arbitrary URLs, query strings, fragments or admin paths into
  // campaign attribution. Website car UUIDs are public listing identifiers.
  const cleanPath = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
  const safePath =
    cleanPath.startsWith('/') &&
    !cleanPath.startsWith('//') &&
    !cleanPath.startsWith('/admin') &&
    !cleanPath.startsWith('/api') &&
    /^\/[a-zA-Z0-9/_-]*$/.test(cleanPath)
      ? cleanPath
      : '/';
  destination.searchParams.set('utm_content', safePath);
  return destination.toString();
}

/** Safe default for any remaining static handoff references. */
export const MOK_BOOKING_URL = bookingUrlForPath('/');
