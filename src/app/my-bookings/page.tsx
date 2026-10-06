'use client';

import { useCallback, useEffect, useState } from 'react';

type BookingRow = {
  id: string;
  carId: string;
  carName: string;
  customerName: string;
  whatsapp: string;
  email: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  status: string;
  createdAt: string;
};

type Status = 'idle' | 'loading' | 'done' | 'error';

const STORAGE_KEY = 'mok_last_whatsapp';

function statusBadge(status: string) {
  const s = (status || 'pending').toLowerCase();
  if (s === 'confirmed') return 'bg-green-100 text-green-800';
  if (s === 'cancelled') return 'bg-red-100 text-red-800';
  return 'bg-amber-100 text-amber-800';
}

export default function MyBookingsPage() {
  const [whatsapp, setWhatsapp] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async (number: string) => {
    const normalized = number.trim();
    if (!normalized) return;
    setStatus('loading');
    setErrorMsg('');
    setBookings([]);
    try {
      const res = await fetch(`/api/bookings?whatsapp=${encodeURIComponent(normalized)}`, {
        cache: 'no-store',
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setErrorMsg(json?.error || 'Could not load your bookings.');
        setStatus('error');
        return;
      }
      const rows: BookingRow[] = Array.isArray(json?.data?.bookings) ? json.data.bookings : [];
      setBookings(rows);
      setStatus('done');
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('whatsapp')?.trim() || '';
    const fromStorage = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) || '' : '';
    const initial = fromUrl || fromStorage;
    if (initial) {
      setWhatsapp(initial);
      void load(initial);
    }
  }, [load]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = whatsapp.trim();
    if (!normalized) return;
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch {}
    void load(normalized);
  };

  const rebookUrl = (b: BookingRow) =>
    `/booking?rebook=${encodeURIComponent(b.id)}&whatsapp=${encodeURIComponent(b.whatsapp)}&car=${encodeURIComponent(
      b.carId || ''
    )}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + '/my-bookings?whatsapp=' + encodeURIComponent(whatsapp));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-14">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">My Bookings</h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            Enter the WhatsApp number you used when you booked, and we&apos;ll bring up your past
            bookings so you can rebook in one tap.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={onSubmit} className="bg-white rounded-2xl p-8 shadow-xl mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your WhatsApp Number
              </label>
              <div className="flex gap-3">
                <input
                  type="tel"
                  className="input-field flex-1"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+60 12-345 6789"
                  required
                />
                <button
                  type="submit"
                  className="btn-whatsapp px-6 whitespace-nowrap disabled:opacity-50"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Loading…' : 'Find my bookings'}
                </button>
              </div>
              {errorMsg && <p className="text-red-600 text-sm mt-3">{errorMsg}</p>}
            </form>

            {status === 'done' && (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
                    <p className="text-gray-600">
                      No past bookings found for this number. Try the number you used when you
                      submitted your inquiry.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">
                        {bookings.length} past booking{bookings.length > 1 ? 's' : ''}
                      </h2>
                      <button
                        type="button"
                        onClick={copyLink}
                        className="text-sm text-gray-500 hover:text-gray-800"
                      >
                        {copied ? 'Link copied!' : 'Copy my-bookings link'}
                      </button>
                    </div>
                    {bookings.map((b) => (
                      <div key={b.id} className="bg-white rounded-2xl p-6 shadow-xl">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="text-lg font-bold">{b.carName || 'Car not specified'}</div>
                            <div className="text-sm text-gray-500">
                              {b.pickupDate} → {b.returnDate}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Pickup: {b.pickupLocation || '—'}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge(b.status)}`}
                            >
                              {(b.status || 'pending').toUpperCase()}
                            </span>
                            <a
                              href={rebookUrl(b)}
                            >
                              Rebook this
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}