'use client';

import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { DEFAULT_PICKUP_LOCATIONS, PickupLocationItem } from '@/lib/pickupLocations';

type PrefillCar = { id?: string; name?: string };

type InquiryFormState = {
  name: string;
  phone: string;
  carInterested: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  extraNote: string;
};

type WhatsAppInquiryContextType = {
  openInquiry: (prefill?: PrefillCar) => void;
};

const WhatsAppInquiryContext = createContext<WhatsAppInquiryContextType>({
  openInquiry: () => {},
});

export function useWhatsAppInquiry() {
  return useContext(WhatsAppInquiryContext);
}

export function buildWhatsAppInquiryMessage({
  businessName,
  form,
}: {
  businessName: string;
  form: InquiryFormState;
}) {
  return `Hello ${businessName}, I would like to inquire about car rental.

Name: ${form.name}
Phone: ${form.phone}
Car Interested: ${form.carInterested}
Pickup Date: ${form.pickupDate}
Return Date: ${form.returnDate}
Pickup Location: ${form.pickupLocation}
Extra Note: ${form.extraNote}

Please help me check availability and price. Thank you.`;
}

export function buildWhatsAppUrl({
  whatsappNumber,
  message,
}: {
  whatsappNumber: string;
  message: string;
}) {
  const number = whatsappNumber.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encoded}`;
}

export default function WhatsAppInquiryProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSiteSettings();

  const [open, setOpen] = useState(false);
  const [prefillCar, setPrefillCar] = useState<PrefillCar>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [pickupLocations, setPickupLocations] = useState<PickupLocationItem[]>(DEFAULT_PICKUP_LOCATIONS);

  const initialForm: InquiryFormState = {
    name: '',
    phone: '',
    carInterested: '',
    pickupDate: '',
    returnDate: '',
    pickupLocation: DEFAULT_PICKUP_LOCATIONS[0]?.label || '',
    extraNote: '',
  };

  const [form, setForm] = useState<InquiryFormState>(initialForm);

  useEffect(() => {
    const loadPickupLocations = async () => {
      try {
        const res = await fetch('/api/content/pickup-locations', { cache: 'no-store' });
        const json = await res.json().catch(() => null);
        const items = Array.isArray(json?.data?.items) ? (json.data.items as any[]) : [];
        const parsed = items
          .map((raw) => {
            const id = typeof raw?.id === 'string' ? raw.id : '';
            const label = typeof raw?.label === 'string' ? raw.label : '';
            if (!id || !label) return null;
            return { id, label };
          })
          .filter(Boolean) as PickupLocationItem[];

        if (parsed.length) {
          setPickupLocations(parsed);
          setForm((prev) => {
            const stillValid = parsed.some((x) => x.label === prev.pickupLocation);
            return stillValid ? prev : { ...prev, pickupLocation: parsed[0].label };
          });
        }
      } catch {}
    };
    void loadPickupLocations();
  }, []);

  const openInquiry = useCallback((prefill?: PrefillCar) => {
    setError('');
    setFallbackUrl('');
    setPrefillCar(prefill || {});
    setForm({ ...initialForm, carInterested: prefill?.name || '' });
    setOpen(true);
    console.info('IK: WhatsApp inquiry opened', { car: prefill?.name || '' });
  }, []);

  const closeInquiry = () => {
    setOpen(false);
    setError('');
    setFallbackUrl('');
  };

  const validate = (data: InquiryFormState) => {
    if (!data.name.trim()) return 'Name is required.';
    if (!data.phone.trim()) return 'Phone number is required.';
    if (!data.carInterested.trim()) return 'Car interested is required.';
    if (!data.pickupDate.trim()) return 'Pickup date is required.';
    if (!data.returnDate.trim()) return 'Return date is required.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFallbackUrl('');

    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    const message = buildWhatsAppInquiryMessage({
      businessName: settings.businessName,
      form,
    });

    const url = buildWhatsAppUrl({
      whatsappNumber: settings.whatsappNumber,
      message,
    });

    try {
      console.info('IK: WhatsApp inquiry submit', { car: form.carInterested });

      const popup = window.open(url, '_blank', 'noopener,noreferrer');
      if (!popup) {
        setFallbackUrl(url);
        setError(
          'Could not open WhatsApp automatically (popup blocked). Tap "Open WhatsApp" below.'
        );
        setSaving(false);
        return;
      }

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: prefillCar.id || '',
          carName: form.carInterested,
          customerName: form.name,
          whatsappNumber: form.phone,
          pickupDate: form.pickupDate,
          returnDate: form.returnDate,
          pickupLocation: form.pickupLocation,
          notes: form.extraNote,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        console.error('IK: Inquiry save failed:', json?.error);
        setError('Failed to save your inquiry. Please try again or message us directly on WhatsApp.');
        setSaving(false);
        return;
      }

      setOpen(false);
      setForm(initialForm);
      setSaving(false);
    } catch (err) {
      console.error('IK: Inquiry save exception:', err);
    }
  };

  const ctx = useMemo<WhatsAppInquiryContextType>(() => ({ openInquiry }), [openInquiry]);

  return (
    <WhatsAppInquiryContext.Provider value={ctx}>
      {children}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">WhatsApp Inquiry</h3>
              <button
                type="button"
                onClick={closeInquiry}
                className="px-3 py-1 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg">{error}</div>}
              {fallbackUrl && (
                <a
                  href={fallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full justify-center text-lg inline-flex"
                >
                  Open WhatsApp
                </a>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+60..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Interested *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={form.carInterested}
                  onChange={(e) => setForm({ ...form, carInterested: e.target.value })}
                  placeholder="e.g. Toyota Alphard"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Date *
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.pickupDate}
                    onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Return Date *
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.returnDate}
                    onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <select
                  className="input-field"
                  value={form.pickupLocation}
                  onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                >
                  {pickupLocations.map((loc) => (
                    <option key={loc.id} value={loc.label}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extra Note / Request
                </label>
                <textarea
                  rows={3}
                  className="input-field resize-none"
                  value={form.extraNote}
                  onChange={(e) => setForm({ ...form, extraNote: e.target.value })}
                  placeholder="Any additional requests..."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-whatsapp w-full justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Submitting...' : 'Submit & Open WhatsApp'}
              </button>
            </form>
          </div>
        </div>
      )}
    </WhatsAppInquiryContext.Provider>
  );
}
